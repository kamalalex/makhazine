"use server";

import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getClients() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    return await prisma.client.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });
}

export async function createClient(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    const validatedData = clientSchema.parse(data);

    const client = await prisma.client.create({
        data: {
            ...validatedData,
            userId: session.user.id,
        },
    });

    revalidatePath("/dashboard/crm");
    return client;
}
