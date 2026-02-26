"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addInvoiceAttachment(invoiceId: string, attachmentString: string) {
    if (!attachmentString) return;
    await (prisma.invoice as any).update({
        where: { id: invoiceId },
        data: {
            attachments: {
                push: attachmentString
            }
        }
    });
    revalidatePath("/dashboard/invoices");
}

export async function removeInvoiceAttachment(invoiceId: string, attachmentString: string) {
    const invoice = await (prisma.invoice as any).findUnique({ where: { id: invoiceId } });
    if (!invoice) return;

    await (prisma.invoice as any).update({
        where: { id: invoiceId },
        data: {
            attachments: invoice.attachments.filter((a: string) => a !== attachmentString)
        }
    });
    revalidatePath("/dashboard/invoices");
}
