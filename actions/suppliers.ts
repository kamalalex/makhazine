"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSuppliers() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.supplier.findMany({
        where: { userId: (session.user as any).adminId || session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            purchaseOrders: {
                select: { id: true }
            }
        }
    });
}

export async function getSupplier(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.supplier.findUnique({
        where: { id, userId: (session.user as any).adminId || session.user.id },
        include: {
            purchaseOrders: {
                orderBy: { date: 'desc' }
            }
        }
    });
}

export async function createSupplier(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const newSupplier = await prisma.supplier.create({
        data: {
            ...data,
            userId: (session.user as any).adminId || session.user.id
        }
    });

    revalidatePath("/dashboard/suppliers");
    return newSupplier;
}

export async function updateSupplier(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const updatedSupplier = await prisma.supplier.update({
        where: { id, userId: (session.user as any).adminId || session.user.id },
        data: {
            name: data.name,
            contactName: data.contactName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            ice: data.ice,
        }
    });

    revalidatePath("/dashboard/suppliers");
    return updatedSupplier;
}

export async function deleteSupplier(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const existingSupplier = await prisma.supplier.findUnique({
        where: { id, userId: (session.user as any).adminId || session.user.id },
        include: { purchaseOrders: true }
    });

    if (!existingSupplier) return { success: false, error: "Fournisseur introuvable" };

    if (existingSupplier.purchaseOrders.length > 0) {
        return { success: false, error: "Impossible de supprimer: Ce fournisseur a des bons de commande liés." };
    }

    await prisma.supplier.delete({
        where: { id, userId: (session.user as any).adminId || session.user.id }
    });

    revalidatePath("/dashboard/suppliers");
    return { success: true };
}
