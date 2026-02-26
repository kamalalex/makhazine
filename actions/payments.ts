"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { paymentSchema } from "@/lib/validations";

export async function addPayment(invoiceId: string, rawData: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const validatedData = paymentSchema.parse(rawData);

    // Create the payment
    await prisma.payment.create({
        data: {
            amount: validatedData.amount,
            date: validatedData.date,
            method: validatedData.method,
            reference: validatedData.reference,
            dueDate: validatedData.dueDate,
            notes: validatedData.notes,
            invoiceId: invoiceId,
        }
    });

    // Update invoice status
    await updateInvoicePaymentStatus(invoiceId);

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");
}

export async function deletePayment(paymentId: string, invoiceId: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    await prisma.payment.delete({
        where: { id: paymentId }
    });

    // Update invoice status
    await updateInvoicePaymentStatus(invoiceId);

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");
}

export async function getPaymentsByInvoice(invoiceId: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.payment.findMany({
        where: { invoiceId },
        orderBy: { date: "desc" }
    });
}

export async function getAllPayments() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.payment.findMany({
        where: {
            invoice: {
                userId: session.user.id
            }
        },
        include: {
            invoice: {
                include: {
                    client: true
                }
            }
        },
        orderBy: { date: "desc" }
    });
}

async function updateInvoicePaymentStatus(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true }
    });

    if (!invoice) return;

    const totalPaid = invoice.payments.reduce((acc: number, p: any) => acc + p.amount, 0);
    const totalAmount = invoice.total;

    let newStatus = "PENDING";
    if (totalPaid >= totalAmount) {
        newStatus = "PAID";
    } else if (totalPaid > 0) {
        newStatus = "PARTIAL";
    }

    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus }
    });
}

export async function getUpcomingCheques() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    return await prisma.payment.findMany({
        where: {
            invoice: {
                userId: session.user.id
            },
            method: { in: ["CHEQUE", "LCN"] },
            dueDate: {
                gte: today,
                lte: nextWeek
            }
        },
        include: {
            invoice: {
                include: {
                    client: true
                }
            }
        },
        orderBy: { dueDate: "asc" }
    });
}
