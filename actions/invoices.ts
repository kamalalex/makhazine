"use server";

import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getInvoices() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.invoice.findMany({
        where: { userId: session.user.id },
        include: {
            client: true,
            payments: true
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createInvoice(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const validatedData = invoiceSchema.parse(data);

    // Calculate total TTC with per-item VAT
    const totalTTC = validatedData.items.reduce((acc, item) => {
        const itemHT = item.price * item.quantity;
        const itemTVA = itemHT * ((item as any).taxRate / 100);
        return acc + itemHT + itemTVA;
    }, 0);

    const finalTotal = totalTTC - validatedData.discount;

    // Financial Risk Check: Credit Limit
    const client = await prisma.client.findFirst({
        where: { id: validatedData.clientId, userId: session.user.id },
        include: {
            invoices: {
                where: {
                    NOT: {
                        OR: [
                            { status: "PAID" },
                            { status: "CANCELLED" }
                        ]
                    }
                }
            }
        }
    });

    if (client && (client as any).creditLimit > 0) {
        const currentEncours = client.invoices.reduce((sum, inv) => sum + inv.total, 0);
        if (currentEncours + finalTotal > (client as any).creditLimit) {
            throw new Error(`Opération bloquée: Le plafond de crédit de ce client (${(client as any).creditLimit} DH) sera dépassé.`);
        }
    }

    const invoice = await (prisma.invoice as any).create({
        data: {
            number: validatedData.number,
            clientId: validatedData.clientId,
            userId: session.user.id,
            date: validatedData.date,
            dueDate: validatedData.dueDate,
            taxRate: validatedData.taxRate, // Keep for backward compatibility/global info
            discount: validatedData.discount,
            total: finalTotal,
            notes: validatedData.notes,
            poNumber: validatedData.poNumber,
            status: "PENDING",
            items: {
                create: validatedData.items.map(item => ({
                    reference: item.reference,
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                    taxRate: (item as any).taxRate,
                })),
            },
        },
    });

    // Automatically convert Prospect to Client
    await prisma.client.update({
        where: { id: validatedData.clientId },
        data: { isProspect: false }
    });

    // Auto-generate Delivery Note (Bon de Livraison)
    await createDeliveryNote(invoice.id);

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");
    return invoice;
}

export async function createQuote(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const validatedData = invoiceSchema.parse(data);

    // Calculate total TTC with per-item VAT
    const totalTTC = validatedData.items.reduce((acc, item) => {
        const itemHT = item.price * item.quantity;
        const itemTVA = itemHT * ((item as any).taxRate / 100);
        return acc + itemHT + itemTVA;
    }, 0);

    const finalTotal = totalTTC - validatedData.discount;

    const quote = await (prisma.quote as any).create({
        data: {
            number: validatedData.number,
            clientId: validatedData.clientId,
            userId: session.user.id,
            date: validatedData.date,
            validUntil: validatedData.dueDate,
            taxRate: validatedData.taxRate,
            discount: validatedData.discount,
            total: finalTotal,
            notes: validatedData.notes,
            status: "SENT",
            items: {
                create: validatedData.items.map(item => ({
                    reference: item.reference,
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                    taxRate: (item as any).taxRate,
                })),
            },
        },
    });

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");
    return quote;
}

export async function getInvoiceById(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.invoice.findUnique({
        where: { id, userId: session.user.id },
        include: {
            client: true,
            items: true,
            user: {
                include: {
                    company: true
                }
            }
        },
    });
}

export async function getQuotes() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.quote.findMany({
        where: { userId: session.user.id },
        include: { client: true, items: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function getQuoteById(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.quote.findUnique({
        where: { id, userId: session.user.id },
        include: {
            client: true,
            items: true,
            user: {
                include: {
                    company: true
                }
            }
        },
    });
}

export async function updateQuote(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const validatedData = invoiceSchema.parse(data);

    const total = validatedData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = total * (1 + validatedData.taxRate / 100) - validatedData.discount;

    // Delete old items and recreate
    await (prisma as any).quoteItem.deleteMany({ where: { quoteId: id } });

    const quote = await (prisma.quote as any).update({
        where: { id, userId: session.user.id },
        data: {
            number: validatedData.number,
            clientId: validatedData.clientId,
            date: validatedData.date,
            validUntil: validatedData.dueDate,
            taxRate: validatedData.taxRate,
            discount: validatedData.discount,
            total: finalTotal,
            notes: validatedData.notes,
            items: {
                create: validatedData.items.map(item => ({
                    reference: item.reference,
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                })),
            },
        },
    });

    revalidatePath("/dashboard/invoices");
    return quote;
}

export async function convertQuoteToInvoice(quoteId: string, customData?: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const quote = await (prisma.quote as any).findUnique({
        where: { id: quoteId },
        include: { items: true }
    });

    if (!quote) throw new Error("Devis non trouvé");

    const dataToUse = customData || {
        number: `FAC-FROM-${quote.number}`,
        clientId: quote.clientId,
        date: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        taxRate: quote.taxRate,
        discount: quote.discount,
        items: quote.items,
        notes: quote.notes,
    };

    const validatedData = invoiceSchema.parse(dataToUse);

    const total = validatedData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = total * (1 + validatedData.taxRate / 100) - validatedData.discount;

    const invoice = await (prisma.invoice as any).create({
        data: {
            number: validatedData.number,
            clientId: validatedData.clientId,
            userId: session.user.id,
            date: validatedData.date,
            dueDate: validatedData.dueDate,
            taxRate: validatedData.taxRate,
            discount: validatedData.discount,
            total: finalTotal,
            notes: validatedData.notes,
            poNumber: validatedData.poNumber,
            quoteNumber: quote.number,
            status: "PENDING",
            items: {
                create: validatedData.items.map(item => ({
                    reference: item.reference,
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                })),
            },
        },
    });

    await (prisma.quote as any).update({
        where: { id: quoteId },
        data: {
            status: "CONVERTED",
            isConverted: true,
            invoiceId: invoice.id
        }
    });

    // Auto-generate Delivery Note (Bon de Livraison)
    await createDeliveryNote(invoice.id);

    revalidatePath("/dashboard/invoices");
    return invoice;
}

export async function createDeliveryNote(invoiceId: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const invoice = await (prisma.invoice as any).findUnique({
        where: { id: invoiceId },
        include: { items: true, deliveryNotes: { include: { items: true } } }
    });

    if (!invoice) throw new Error("Facture non trouvée");

    if (invoice.deliveryNotes && invoice.deliveryNotes.length > 0) {
        return invoice.deliveryNotes[0];
    }

    const blNumber = `BL-${invoice.number.split('-').slice(1).join('-') || invoice.number}`;

    const deliveryNote = await (prisma as any).deliveryNote.create({
        data: {
            number: blNumber,
            invoiceId: invoice.id,
            clientId: invoice.clientId,
            userId: session.user.id,
            items: {
                create: invoice.items.map((item: any) => ({
                    reference: item.reference,
                    description: item.description,
                    quantity: item.quantity,
                })),
            },
        },
    });

    revalidatePath("/dashboard/invoices");
    return deliveryNote;
}

export async function getInvoiceBLs(invoiceId: string) {
    return await (prisma as any).deliveryNote.findMany({
        where: { invoiceId },
        include: { items: true }
    });
}
