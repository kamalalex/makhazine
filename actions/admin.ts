"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function ensureAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Accès refusé. Vous n'êtes pas administrateur.");
    }
}

export async function getAllUsers() {
    await ensureAdmin();
    return await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: { company: true },
    });
}

export async function updateUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED" | "PENDING") {
    await ensureAdmin();
    await prisma.user.update({
        where: { id: userId },
        data: { status },
    });
    revalidatePath("/admin");
}

export async function updateUserSubscription(
    userId: string,
    type: "DEMO" | "BASIC" | "PREMIUM" | "GOLD",
    months: number | "unlimited"
) {
    await ensureAdmin();

    let expiryDate: Date | null = null;
    if (months === "unlimited") {
        expiryDate = null;
    } else {
        expiryDate = new Date();
        // Use days (30) or months
        if (months === 1) { // treat 1 as 30 days
            expiryDate.setDate(expiryDate.getDate() + 30);
        } else {
            expiryDate.setMonth(expiryDate.getMonth() + months);
        }
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            subscriptionType: type,
            subscriptionExpiresAt: expiryDate,
            status: "ACTIVE" // Auto-activate if updating subscription
        },
    });
    revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
    await ensureAdmin();
    await prisma.user.delete({
        where: { id: userId },
    });
    revalidatePath("/admin");
}
