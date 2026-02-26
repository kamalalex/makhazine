"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getCompany() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.company.findUnique({
        where: { userId: session.user.id },
    });
}

export async function updateCompany(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const company = await prisma.company.upsert({
        where: { userId: session.user.id },
        update: data,
        create: {
            ...data,
            userId: session.user.id,
        },
    });

    revalidatePath("/dashboard/settings");
    return company;
}
