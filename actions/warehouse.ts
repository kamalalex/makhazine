"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getWarehouses() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.warehouse.findMany({
        where: { userId: (session.user as any).adminId || session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            stocks: {
                include: {
                    product: true
                }
            }
        }
    });
}

export async function createWarehouse(data: {
    name: string;
    address: string;
    city: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    allowedCategories?: string[];
}) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    // Check subscription limits
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            _count: {
                select: { warehouses: true }
            }
        }
    }) as any;

    if (!user) throw new Error("Utilisateur non trouvé");

    if (user.subscriptionType === "BASIC") {
        throw new Error("Le pack Basic ne permet pas la gestion de dépôts.");
    }

    if (user.subscriptionType === "PREMIUM" && user._count.warehouses >= 1) {
        throw new Error("Le pack Premium est limité à un seul dépôt.");
    }

    const warehouse = await prisma.warehouse.create({
        data: {
            ...data,
            userId: (session.user as any).adminId || session.user.id,
        }
    });

    revalidatePath("/dashboard/stock");
    revalidatePath("/dashboard/warehouses");
    return warehouse;
}

export async function updateWarehouse(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const warehouse = await prisma.warehouse.update({
        where: { id, userId: (session.user as any).adminId || session.user.id },
        data
    });

    revalidatePath("/dashboard/warehouses");
    return warehouse;
}

export async function deleteWarehouse(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    await prisma.warehouse.delete({
        where: { id, userId: (session.user as any).adminId || session.user.id }
    });

    revalidatePath("/dashboard/warehouses");
}

export async function getWarehouseStock(warehouseId: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.warehouseStock.findMany({
        where: { warehouseId },
        include: { product: true }
    });
}

export async function getWarehouseHistory(warehouseId: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.stockMovement.findMany({
        where: { warehouseId },
        include: {
            product: true
        },
        orderBy: { createdAt: "desc" }
    });
}
