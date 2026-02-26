"use server";

import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getClients() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await (prisma.client as any).findMany({
        where: { userId: session.user.id },
        include: {
            invoices: {
                select: {
                    total: true,
                    status: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createClient(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const validatedData = clientSchema.parse(data);

    // Anti-doublon check
    if (validatedData.email) {
        const existingEmail = await (prisma.client as any).findFirst({
            where: { email: validatedData.email, userId: session.user.id }
        });
        if (existingEmail) throw new Error("Un client avec cet email existe déjà.");
    }

    if (validatedData.ice) {
        const existingIce = await (prisma.client as any).findFirst({
            where: { ice: validatedData.ice, userId: session.user.id }
        });
        if (existingIce) throw new Error("Un client avec cet ICE existe déjà.");
    }

    try {
        const client = await (prisma.client as any).create({
            data: {
                ...validatedData,
                userId: session.user.id,
            },
        });

        revalidatePath("/dashboard/crm");
        return client;
    } catch (error: any) {
        throw new Error(error.message || "Erreur lors de la création du client");
    }
}

export async function updateClient(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const validatedData = clientSchema.parse(data);

    const client = await prisma.client.update({
        where: { id, userId: session.user.id },
        data: validatedData,
    });

    revalidatePath("/dashboard/crm");
    return client;
}

export async function archiveClient(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    await (prisma.client as any).update({
        where: { id, userId: session.user.id },
        data: { isArchived: true },
    });

    revalidatePath("/dashboard/crm");
}

export async function getClientStats(clientId: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const clientRaw = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
        include: {
            invoices: {
                select: {
                    total: true,
                    status: true,
                    dueDate: true,
                    createdAt: true,
                    lastReminderAt: true,
                    reminderHistory: true,
                    number: true,
                }
            },
            quotes: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            },
            interactions: {
                orderBy: { date: 'desc' }
            }
        }
    });

    if (!clientRaw) throw new Error("Client non trouvé");
    const client = clientRaw as any;

    const ltv = client.invoices.reduce((sum: number, inv: any) => sum + inv.total, 0);
    const encours = client.invoices
        .filter((inv: any) => inv.status !== "PAID" && inv.status !== "CANCELLED")
        .reduce((sum: number, inv: any) => sum + inv.total, 0);

    const overdueInvoices = client.invoices.filter((inv: any) =>
        inv.status !== "PAID" &&
        new Date(inv.dueDate) < new Date()
    );

    const hasOverdue = overdueInvoices.length > 0;

    return {
        ltv,
        encours,
        hasOverdue,
        overdueCount: overdueInvoices.length,
        creditLimit: (client as any).creditLimit,
        isOverLimit: (client as any).creditLimit ? encours > (client as any).creditLimit : false,
        lastInteractions: client.interactions,
        recentQuotes: client.quotes,
        invoiceCount: client.invoices.length,
        invoices: client.invoices
    };
}

export async function toggleAutoReminders(clientId: string, enabled: boolean) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    await prisma.client.update({
        where: { id: clientId, userId: session.user.id },
        data: { autoRemindersEnabled: enabled },
    });

    revalidatePath(`/dashboard/crm/${clientId}`);
}
