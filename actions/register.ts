"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail, sendAdminNotification } from "@/lib/mail";

const registerSchema = z.object({
    name: z.string().min(2, "Nom trop court"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Mot de passe trop court"),
    // Company fields
    companyName: z.string().min(2, "Nom de société requis"),
    ice: z.string().min(1, "ICE requis"),
    rc: z.string().min(1, "RC requis"),
    if: z.string().min(1, "IF requis"),
    cn: z.string().min(1, "CN requis"),
    phone: z.string().min(1, "Téléphone requis"),
    address: z.string().min(1, "Adresse requise"),
    bankAccount: z.string().min(1, "RIB requis"),
    cinNumber: z.string().min(1, "N° CIN requis"),
});

export async function registerUser(data: any) {
    const validatedData = registerSchema.parse(data);

    const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
    });

    if (existingUser) {
        throw new Error("Cet email est déjà utilisé");
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const verificationToken = uuidv4();

    // Set subscription to expire in 30 days (DEMO period)
    const subscriptionExpiresAt = new Date();
    subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + 30);

    const user = await prisma.user.create({
        data: {
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            verificationToken,
            status: "PENDING",
            subscriptionType: "DEMO",
            subscriptionExpiresAt,
            role: "USER",
            company: {
                create: {
                    name: validatedData.companyName,
                    ice: validatedData.ice,
                    rc: validatedData.rc,
                    if: validatedData.if,
                    cn: validatedData.cn,
                    phone: validatedData.phone,
                    address: validatedData.address,
                    bankAccount: validatedData.bankAccount,
                    cinNumber: validatedData.cinNumber,
                }
            }
        },
        include: { company: true }
    });

    // Background tasks
    try {
        await sendVerificationEmail(user.email!, verificationToken);
        await sendAdminNotification({
            name: user.name,
            email: user.email,
            companyName: user.company?.name,
            ice: user.company?.ice,
        });
    } catch (error) {
        console.error("Failed to send emails:", error);
    }

    return { success: true, user: { id: user.id, email: user.email } };
}
