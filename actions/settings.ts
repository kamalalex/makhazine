"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getCompany() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.company.findUnique({
        where: { userId: (session.user as any).adminId || session.user.id },
        include: {
            bankAccounts: {
                orderBy: { isMain: 'desc' },
            }
        }
    });
}

export async function updateCompany(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const company = await prisma.company.upsert({
        where: { userId: (session.user as any).adminId || session.user.id },
        update: data,
        create: {
            ...data,
            userId: (session.user as any).adminId || session.user.id,
        },
    });

    revalidatePath("/dashboard/settings");
    return company;
}

export async function addBankAccount(data: { bankName: string, bankAddress?: string, rib: string, swift?: string, contactName?: string, contactPhone?: string }) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const company = await prisma.company.findUnique({ where: { userId: (session.user as any).adminId || session.user.id }, include: { bankAccounts: true } });
    if (!company) throw new Error("Société non trouvée");

    // Make it main if it's the first one
    const isMain = company.bankAccounts.length === 0;

    const newAccount = await prisma.bankAccount.create({
        data: {
            ...data,
            isMain,
            companyId: company.id
        }
    });

    revalidatePath("/dashboard/settings");
    return newAccount;
}

export async function updateBankAccount(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    // Check ownership
    const account = await prisma.bankAccount.findUnique({ where: { id }, include: { company: true } });
    if (!account || account.company.userId !== session.user.id) throw new Error("Non autorisé");

    const updatedAccount = await prisma.bankAccount.update({
        where: { id },
        data
    });

    revalidatePath("/dashboard/settings");
    return updatedAccount;
}

export async function deleteBankAccount(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const account = await prisma.bankAccount.findUnique({ where: { id }, include: { company: true } });
    if (!account || account.company.userId !== session.user.id) throw new Error("Non autorisé");

    await prisma.bankAccount.delete({ where: { id } });

    // If it was main and there are others, set another one as main
    if (account.isMain) {
        const otherAccount = await prisma.bankAccount.findFirst({ where: { companyId: account.companyId } });
        if (otherAccount) {
            await prisma.bankAccount.update({
                where: { id: otherAccount.id },
                data: { isMain: true }
            });
        }
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
}

export async function setMainBankAccount(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const account = await prisma.bankAccount.findUnique({ where: { id }, include: { company: true } });
    if (!account || account.company.userId !== session.user.id) throw new Error("Non autorisé");

    // Reset all to not main
    await prisma.bankAccount.updateMany({
        where: { companyId: account.companyId },
        data: { isMain: false }
    });

    // Set this one to main
    await prisma.bankAccount.update({
        where: { id },
        data: { isMain: true }
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
}

export async function updateRolePermissions(permissions: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const userId = (session.user as any).adminId || session.user.id;

    await (prisma.company as any).update({
        where: { userId },
        data: { rolePermissions: permissions }
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
}
