"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- SUPPLIERS ---

export async function getSuppliers() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.supplier.findMany({
        where: { userId: (session.user as any).adminId || session.user.id },
        orderBy: { createdAt: 'desc' }
    });
}

// --- SMART RESTOCK (Assistant de Réapprovisionnement) ---

export async function getRestockSuggestions() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    // L'IA (Logique) analyse le stock actuel par rapport à lowStockAlert
    const productsToRestock = await prisma.product.findMany({
        where: { userId: (session.user as any).adminId || session.user.id,
            // Seulement les produits dont le stock en dessous de l'alerte
            // Prisma ne permet pas de comparer deux colonnes directement dans findMany (stock <= lowStockAlert) sans rawQuery,
            // on filtre donc manuellement ou avec un simple condition si disponible, ici on va fetch puis filter
        },
        include: {
            // Check past purchase items to find the best supplier for this product
            purchaseItems: {
                where: { purchaseOrder: { status: "INVOICED" } },
                include: { purchaseOrder: { include: { supplier: true } } },
                orderBy: { unitPrice: 'asc' }
            }
        }
    });

    const suggestions = productsToRestock
        .filter(p => p.stock <= p.lowStockAlert)
        .map(p => {
            // Find the best historical supplier price
            const bestPurchase = p.purchaseItems.length > 0 ? p.purchaseItems[0] : null;

            return {
                product: p,
                suggestedQuantity: p.lowStockAlert * 2 - p.stock, // Algo simple: commander de quoi doubler le seuil d'alerte
                bestSupplier: bestPurchase?.purchaseOrder?.supplier,
                bestHistoricalPrice: bestPurchase?.unitPrice,
            };
        });

    return suggestions;
}

// --- PURCHASE ORDERS ---

export async function getPurchaseOrders() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.purchaseOrder.findMany({
        where: { userId: (session.user as any).adminId || session.user.id },
        include: { supplier: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getProductsToPurchase() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.product.findMany({
        where: { userId: (session.user as any).adminId || session.user.id },
        select: { id: true, name: true, reference: true, price: true, category: true, costPrice: true }
    });
}

export async function createPurchaseOrder(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const po = await prisma.purchaseOrder.create({
        data: {
            number: data.number,
            status: "DRAFT",
            supplierId: data.supplierId,
            userId: (session.user as any).adminId || session.user.id,
            createdByName: session.user.name,
            additionalCosts: data.additionalCosts || 0,
            notes: data.notes || null,
            expectedDate: data.expectedDate,
            items: {
                create: data.items.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.orderedQuantity || item.quantity,
                    unitOfMeasure: item.unitOfMeasure || "UNITE",
                    conversionFactor: item.conversionFactor || 1,
                    unitPrice: item.unitPrice,
                }))
            }
        }
    });

    revalidatePath("/dashboard/purchases");
    return po;
}

export async function processPurchaseOrder(id: string, newStatus: string, validationData?: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const po = await prisma.purchaseOrder.findUnique({
        where: { id, userId: (session.user as any).adminId || session.user.id },
        include: { items: { include: { product: true } } }
    });

    if (!po) throw new Error("Bon de commande introuvable");

    // Transition Workflow
    if (newStatus === "ORDERED") {
        // Envoi email fictif
        await prisma.purchaseOrder.update({
            where: { id },
            data: { status: "ORDERED" }
        });
    }

    if (newStatus === "RECEIVED") {
        // Validation des quantités reçues
        if (!validationData || !validationData.items) throw new Error("Données de réception manquantes");

        let hasDiscrepancy = false;

        // Transaction pour mettre à jour les quantités reçues et le stock (Incrémentation)
        await prisma.$transaction(async (tx) => {
            for (const vItem of validationData.items) {
                const poItem = po.items.find(i => i.id === vItem.id);
                if (!poItem) continue;

                if (vItem.receivedQuantity !== poItem.quantity) {
                    hasDiscrepancy = true;
                }

                await tx.purchaseOrderItem.update({
                    where: { id: poItem.id },
                    data: { receivedQuantity: vItem.receivedQuantity }
                });

                // Incrémentation du stock physique via le facteur de conversion !
                // 1 Carton (reçu) = X Unités de vente
                const addedStock = vItem.receivedQuantity * poItem.conversionFactor;

                if (addedStock > 0) {
                    const product = poItem.product;

                    // == 2. Algorithme PMP (Prix Moyen Pondéré) et Frais d'approche (Landed Cost) ==
                    // Frais d'approche (ex: Douane, Transport) répartis au montant proportionnel de l'article sur la commande
                    // Cost of this line = receivedQty * unitPrice
                    const lineTotal = vItem.receivedQuantity * poItem.unitPrice;

                    // Total PO sans frais
                    const poTotal = po.items.reduce((acc, item) => {
                        const rQty = validationData.items.find((v: any) => v.id === item.id)?.receivedQuantity || item.quantity;
                        return acc + (rQty * item.unitPrice);
                    }, 0);

                    // Quote-part des frais d'approche
                    const quotePartRatio = poTotal > 0 ? (lineTotal / poTotal) : 0;
                    const portionAdditionalCosts = po.additionalCosts * quotePartRatio;

                    // Coût total du lot entrant = Prix achat ligne + Quote part frais
                    const totalLotCost = lineTotal + portionAdditionalCosts;

                    // Prix unitaire réel (Landed Cost par UNITE DE VENTE)
                    const landedCostPerSaleUnit = totalLotCost / addedStock;

                    // Calcul du PMP Moteur : (Valeur Stock Ancien + Valeur Nouveau Lot) / (Qte Ancienne + Qte Recue)
                    const oldStockQty = product.stock;
                    const oldPmp = product.costPrice || product.price; // fallback au prix de base si null

                    const newTotalQty = oldStockQty + addedStock;
                    const newPMP = ((oldStockQty * oldPmp) + totalLotCost) / newTotalQty;

                    // Mise à jour du produit (Stock + PMP)
                    await tx.product.update({
                        where: { id: product.id },
                        data: {
                            stock: { increment: addedStock },
                            costPrice: newPMP // Mise à jour du PMP global
                        }
                    });

                    // Trace Mouvement de stock
                    await tx.stockMovement.create({
                        data: {
                            type: "IN",
                            quantity: addedStock,
                            note: `Réception BC N° ${po.number} - PMP MàJ: ${newPMP.toFixed(2)}`,
                            productId: product.id,
                            userId: (session.user as any).adminId || session.user.id
                        }
                    });
                }
            }

            // Si tout est reçu, passer à RECEIVED, sinon PARTIAL
            await tx.purchaseOrder.update({
                where: { id },
                data: { status: hasDiscrepancy ? "PARTIAL" : "RECEIVED" }
            });
        });
    }

    if (newStatus === "INVOICED") {
        // Le Contrôleur de Conformité (Matching)
        // Comparer facturé avec commandé/reçu
        if (!validationData || !validationData.invoiceNumber || !validationData.invoiceTotal) {
            throw new Error("Facture manquante");
        }

        // Calcul du total qu'on est censé avoir reçu
        const expectedTotal = po.items.reduce((acc, item) => acc + (item.receivedQuantity * item.unitPrice), 0);

        // Alerte si le total facturé dépasse le total attendu !
        if (validationData.invoiceTotal > expectedTotal + po.additionalCosts + 1) { // marge erreur 1Mhd
            throw new Error(`⚠️ Anomalie de Conformité : Le total facturé (${validationData.invoiceTotal}) dépasse la valeur reçue estimée (${(expectedTotal + po.additionalCosts).toFixed(2)}). Validation bloquée.`);
        }

        await prisma.$transaction(async (tx) => {
            // Mettre à jour BC
            const updatedPO = await tx.purchaseOrder.update({
                where: { id },
                data: {
                    status: "INVOICED",
                    invoiceNumber: validationData.invoiceNumber,
                    invoiceTotal: validationData.invoiceTotal,
                }
            });

            // Lien Financier : Création d'une entrée dans Payments avec le statut "À payer" (OUT)
            await tx.payment.create({
                data: {
                    amount: validationData.invoiceTotal,
                    date: new Date(),
                    method: null, // Pas encore payé
                    reference: validationData.invoiceNumber,
                    notes: `Dette Achat Fournisseur - BC ${po.number}`,
                    type: "OUT", // Dépense Fournisseur
                    status: "PENDING", // -> À Payer
                    purchaseOrderId: po.id
                }
            });
        });
    }

    revalidatePath("/dashboard/purchases");
    return { success: true };
}

export async function getPurchaseOrder(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.purchaseOrder.findUnique({
        where: { id, userId: (session.user as any).adminId || session.user.id },
        include: {
            supplier: true,
            items: { include: { product: true } },
            payments: true
        }
    });
}
