"use server";

import { sendDocumentEmail } from "@/lib/mail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function shareDocumentAction(to: string, subject: string, message: string, filename: string, base64Data: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non autorisé");

    await sendDocumentEmail(to, subject, message, filename, base64Data);
}
