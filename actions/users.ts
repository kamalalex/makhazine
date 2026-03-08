"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function getUserProfile() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            role: true,
        }
    });
}

export async function updateUserProfile(data: { name?: string; email?: string; phone?: string; image?: string; password?: string }) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const updateData: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
    };

    if (data.image) updateData.image = data.image;

    if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
}

export async function createSubUser(data: { name: string; email: string; password?: string; role: any }) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    // Only Admin can create sub-users
    if (session.user.role !== "ADMIN" && session.user.role !== "USER") {
        throw new Error("Seul l'administrateur peut créer des utilisateurs.");
    }

    const password = data.password || "123456"; // Default password if empty
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            adminId: session.user.id,
            status: "ACTIVE",
            subscriptionType: (session.user as any).subscriptionType || "DEMO"
        }
    });

    revalidatePath("/dashboard/settings");
    return { success: true, user: newUser };
}

export async function getSubUsers() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.user.findMany({
        where: {
            adminId: session.user.id,
            status: { not: "ARCHIVED" }
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
        }
    });
}

export async function archiveSubUser(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    if (session.user.role !== "ADMIN" && session.user.role !== "USER") {
        throw new Error("Seul l'administrateur peut supprimer des utilisateurs.");
    }

    const userToArchive = await prisma.user.findUnique({ where: { id } });
    if (!userToArchive || userToArchive.adminId !== session.user.id) {
        throw new Error("Utilisateur non trouvé ou non autorisé.");
    }

    // Soft delete : We keep the trace but mark as ARCHIVED
    await prisma.user.update({
        where: { id },
        data: { status: "ARCHIVED" }
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
}

export async function getUserProductivity() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const adminId = (session.user as any).adminId || session.user.id;

    // Fetch all users associated with this admin
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { id: adminId },
                { adminId: adminId }
            ],
            status: "ACTIVE"
        },
        select: { id: true, name: true, role: true, email: true, image: true }
    });

    const productivity = await Promise.all(users.map(async (u) => {
        const [clients, invoices, quotes, movements] = await Promise.all([
            prisma.client.count({ where: { createdByName: u.name, userId: adminId } as any }),
            prisma.invoice.count({ where: { createdByName: u.name, userId: adminId } as any }),
            prisma.quote.count({ where: { createdByName: u.name, userId: adminId } as any }),
            prisma.stockMovement.count({ where: { createdByName: u.name, userId: adminId } as any }),
        ]);

        return {
            ...u,
            stats: { clients, invoices, quotes, movements }
        };
    }));

    return productivity;
}
