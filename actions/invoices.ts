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
        include: { client: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function createInvoice(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const validatedData = invoiceSchema.parse(data);

    // Calculate total
    const total = validatedData.items.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
    }, 0);

    const finalTotal = total * (1 + validatedData.taxRate / 100) - validatedData.discount;

    const invoice = await prisma.invoice.create({
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
            items: {
                create: validatedData.items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                })),
            },
        },
    });

    revalidatePath("/dashboard/invoices");
    return invoice;
}
