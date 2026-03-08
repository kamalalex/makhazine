"use server";

import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getProducts(search?: string, category?: string, status?: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const where: any = { userId: (session.user as any).adminId || session.user.id };

    if (search) {
        where.OR = [
            { reference: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (category && category !== "Toutes les catégories") {
        where.category = category;
    }

    const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            movements: true,
            warehouseStocks: {
                include: {
                    warehouse: true
                }
            }
        },
    });

    const productsWithStats = products.map((product: any) => {
        const totalIn = product.movements
            ? (product.movements as any[])
                .filter((m: any) => m.type === "IN")
                .reduce((acc: number, m: any) => acc + m.quantity, 0)
            : 0;

        const totalOut = product.movements
            ? (product.movements as any[])
                .filter((m: any) => m.type === "OUT")
                .reduce((acc: number, m: any) => acc + m.quantity, 0)
            : 0;

        return {
            ...product,
            totalIn,
            totalOut
        };
    });

    if (status && status !== "Tout le stock") {
        if (status === "Stock faible") {
            return productsWithStats.filter((p: any) => p.stock <= p.lowStockAlert && p.stock > 0);
        }
        if (status === "Rupture") {
            return productsWithStats.filter((p: any) => p.stock <= 0);
        }
    }

    return productsWithStats;
}

export async function getCategories() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const products = await prisma.product.findMany({
        where: { userId: (session.user as any).adminId || session.user.id,
            category: { not: "" }
        },
        select: { category: true },
        distinct: ['category'],
    });

    return products.map(p => p.category as string);
}

export async function createProduct(data: any, warehouseId?: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const validatedData = productSchema.parse(data);

    const product = await prisma.$transaction(async (tx: any) => {
        const p = await tx.product.create({
            data: {
                ...validatedData,
                userId: (session.user as any).adminId || session.user.id,
            createdByName: session.user.name,
            },
        });

        // Initialize warehouse stock if provided
        if (warehouseId && warehouseId !== "default" && validatedData.stock > 0) {
            await tx.warehouseStock.create({
                data: {
                    productId: p.id,
                    warehouseId: warehouseId,
                    quantity: validatedData.stock
                }
            });

            // Log initial movement
            await tx.stockMovement.create({ data: {
                    type: "IN",
                    quantity: validatedData.stock,
                    note: "Stock initial",
                    productId: p.id,
                    warehouseId: warehouseId,
                    userId: (session.user as any).adminId || session.user.id,
                    createdByName: session.user.name
                }
            });
        }

        return p;
    });

    revalidatePath("/dashboard/stock");
    return product;
}

export async function updateProduct(id: string, data: any, warehouseId?: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const validatedData = productSchema.parse(data);

    const product = await prisma.$transaction(async (tx: any) => {
        // Get current product to check stock difference
        const currentProduct = await tx.product.findUnique({
            where: { id, userId: (session.user as any).adminId || session.user.id },
            include: { warehouseStocks: true }
        });

        if (!currentProduct) throw new Error("Produit non trouvé");

        const updatedProduct = await tx.product.update({
            where: { id },
            data: validatedData,
        });

        // Handle Warehouse Stock if warehouseId is provided
        if (warehouseId && warehouseId !== "default") {
            // Find if this product already has stock in this specific warehouse
            const existingWS = await tx.warehouseStock.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: id,
                        warehouseId: warehouseId
                    }
                }
            });

            if (existingWS) {
                // If stock was manually changed in the form, sync it to this warehouse
                if (validatedData.stock !== currentProduct.stock) {
                    const diff = validatedData.stock - currentProduct.stock;
                    await tx.warehouseStock.update({
                        where: { id: existingWS.id },
                        data: { quantity: { increment: diff } }
                    });

                    // Log adjustment
                    await tx.stockMovement.create({ data: {
                            type: diff > 0 ? "IN" : "OUT",
                            quantity: Math.abs(diff),
                            note: "Ajustement via modification fiche",
                            productId: id,
                            warehouseId: warehouseId,
                            userId: (session.user as any).adminId || session.user.id,
                    createdByName: session.user.name
                        }
                    });
                }
            } else {
                // If it's a new assignment for this warehouse during an update
                // We only assign the "difference" if the total was increased, 
                // or we just initialize it at 0 if the total didn't change.
                const diff = Math.max(0, validatedData.stock - currentProduct.stock);

                await tx.warehouseStock.create({
                    data: {
                        productId: id,
                        warehouseId: warehouseId,
                        quantity: diff
                    }
                });

                if (diff > 0) {
                    await tx.stockMovement.create({ data: {
                            type: "IN",
                            quantity: diff,
                            note: "Allocation initiale (ajustement total)",
                            productId: id,
                            warehouseId: warehouseId,
                            userId: (session.user as any).adminId || session.user.id,
                    createdByName: session.user.name
                        }
                    });
                }
            }
        }

        return updatedProduct;
    });

    revalidatePath("/dashboard/stock");
    return product;
}

export async function deleteProduct(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    await prisma.product.delete({
        where: {
            id,
            userId: (session.user as any).adminId || session.user.id
        },
    });

    revalidatePath("/dashboard/stock");
}

export async function createStockMovement(productId: string, type: "IN" | "OUT", quantity: number, note?: string, warehouseId?: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const movement = await prisma.$transaction(async (tx: any) => {
        // Create movement
        const m = await tx.stockMovement.create({ data: {
                type,
                quantity,
                note,
                productId,
                warehouseId,
                userId: (session.user as any).adminId || session.user.id,
                    createdByName: session.user.name
            }
        });

        // Update global stock level
        await tx.product.update({
            where: { id: productId },
            data: {
                stock: {
                    [type === "IN" ? "increment" : "decrement"]: quantity
                }
            }
        });

        // Update warehouse specific stock
        if (warehouseId) {
            await tx.warehouseStock.upsert({
                where: {
                    productId_warehouseId: {
                        productId,
                        warehouseId
                    }
                },
                update: {
                    quantity: {
                        [type === "IN" ? "increment" : "decrement"]: quantity
                    }
                },
                create: {
                    productId,
                    warehouseId,
                    quantity: type === "IN" ? quantity : -quantity
                }
            });
        }

        return m;
    });

    revalidatePath("/dashboard/stock");
    return movement;
}

export async function getProductHistory(productId: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.stockMovement.findMany({
        where: {
            productId,
            userId: (session.user as any).adminId || session.user.id
        },
        orderBy: { createdAt: "desc" },
        include: {
            warehouse: true
        } as any
    });
}

export async function transferStock(
    productId: string,
    fromWarehouseId: string | "default",
    toWarehouseId: string | "default",
    quantity: number,
    note?: string
) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    if (fromWarehouseId === toWarehouseId) {
        throw new Error("Le dépôt source et destination doivent être différents");
    }

    const result = await prisma.$transaction(async (tx: any) => {
        // 1. Decrease source
        if (fromWarehouseId !== "default") {
            const sourceWS = await tx.warehouseStock.findUnique({
                where: {
                    productId_warehouseId: { productId, warehouseId: fromWarehouseId }
                }
            });

            if (!sourceWS || sourceWS.quantity < quantity) {
                throw new Error("Stock insuffisant dans le dépôt source");
            }

            await tx.warehouseStock.update({
                where: { id: sourceWS.id },
                data: { quantity: { decrement: quantity } }
            });

            // Log OUT for source
            await tx.stockMovement.create({ data: {
                    type: "OUT",
                    quantity,
                    note: `Transfert vers ${toWarehouseId === "default" ? "Stock Global" : "autre dépôt"}. ${note || ""}`,
                    productId,
                    warehouseId: fromWarehouseId,
                    userId: (session.user as any).adminId || session.user.id,
                    createdByName: session.user.name
                }
            });
        } else {
            // Transferring from "Global/Unassigned" pool
            const product = await tx.product.findFirst({
                where: { id: productId },
                include: { warehouseStocks: true }
            });

            if (!product) throw new Error("Produit non trouvé");

            const assignedStock = product.warehouseStocks.reduce((acc: number, ws: any) => acc + ws.quantity, 0);
            const unassignedStock = product.stock - assignedStock;

            if (unassignedStock < quantity) {
                throw new Error(`Stock non affecté insuffisant (${unassignedStock} dispos).`);
            }

            // Log OUT for global (unassigned part)
            await tx.stockMovement.create({ data: {
                    type: "OUT",
                    quantity,
                    note: `Transfert depuis stock non affecté towards warehouse. ${note || ""}`,
                    productId,
                    userId: (session.user as any).adminId || session.user.id,
                    createdByName: session.user.name
                }
            });
        }

        // 2. Increase destination
        if (toWarehouseId !== "default") {
            const destWS = await tx.warehouseStock.findUnique({
                where: {
                    productId_warehouseId: { productId, warehouseId: toWarehouseId }
                }
            });

            if (destWS) {
                await tx.warehouseStock.update({
                    where: { id: destWS.id },
                    data: { quantity: { increment: quantity } }
                });
            } else {
                await tx.warehouseStock.create({
                    data: { productId, warehouseId: toWarehouseId, quantity }
                });
            }

            // Log IN for destination
            await tx.stockMovement.create({ data: {
                    type: "IN",
                    quantity,
                    note: `Transfert reçu de ${fromWarehouseId === "default" ? "Stock Global" : "autre dépôt"}. ${note || ""}`,
                    productId,
                    warehouseId: toWarehouseId,
                    userId: (session.user as any).adminId || session.user.id,
                    createdByName: session.user.name
                }
            });
        } else {
            // Transferring back to "Global/Unassigned" pool
            // No need to update product.stock as it already includes this quantity globally
            // Just log the movement to track the return to unassigned status
            await tx.stockMovement.create({ data: {
                    type: "IN",
                    quantity,
                    note: `Retour vers stock non affecté. ${note || ""}`,
                    productId,
                    userId: (session.user as any).adminId || session.user.id,
                    createdByName: session.user.name
                }
            });
        }

        return { success: true };
    });

    revalidatePath("/dashboard/stock");
    return result;
}
