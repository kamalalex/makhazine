import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

interface ReminderContent {
    subject: string;
    title: string;
    message: string;
    urgency: "low" | "medium" | "high" | "critical";
}

const GET_REMINDER_CONTENT = (type: string, invoiceNumber: string): ReminderContent => {
    switch (type) {
        case "PRE_J7":
            return {
                subject: `🔎 Prochaine échéance : Facture ${invoiceNumber}`,
                title: "Échéance à venir",
                message: "Ceci est un petit rappel amical pour vous informer que votre facture arrivera à échéance dans une semaine. Nous restons à votre disposition pour toute question.",
                urgency: "low"
            };
        case "POST_J1":
            return {
                subject: `⌛ Échéance dépassée : Facture ${invoiceNumber}`,
                title: "Paiement en attente",
                message: "Sauf erreur de notre part, nous n'avons pas encore reçu le règlement de votre facture qui était due hier. Nous vous prions de bien vouloir régulariser cette situation.",
                urgency: "medium"
            };
        case "POST_J7":
            return {
                subject: `⚠️ 1ère Relance : Facture ${invoiceNumber} en retard`,
                title: "Rappel de paiement",
                message: "Malgré notre précédent message, votre facture présente un retard de 7 jours. Nous vous serions reconnaissants de procéder au règlement dans les plus brefs délais.",
                urgency: "medium"
            };
        case "POST_J14":
            return {
                subject: `⛔ 2ème Relance : Retard important - Facture ${invoiceNumber}`,
                title: "Retard de paiement",
                message: "Votre facture présente désormais un retard de 2 semaines. Ce retard affecte notre gestion comptable. Merci de confirmer l'ordre de virement aujourd'hui.",
                urgency: "high"
            };
        case "POST_J30":
            return {
                subject: `🚨 DERNIER AVIS : Mise en demeure - Facture ${invoiceNumber}`,
                title: "Action requise immédiate",
                message: "Votre facture est impayée depuis plus de 30 jours. Sans règlement sous 48h, nous serons contraints de suspendre vos services ou livraisons en cours.",
                urgency: "critical"
            };
        default:
            return {
                subject: `🔔 Suivi de règlement : Facture ${invoiceNumber}`,
                title: "SOLDE IMPAYÉ",
                message: "Votre dossier présente toujours un solde impayé. Merci de nous contacter pour convenir d'un plan de règlement si vous rencontrez des difficultés.",
                urgency: "critical"
            };
    }
};

async function runReminders() {
    console.log("--- Démarrage de la séquence de relances personnalisées ---");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const invoices = (await (prisma.invoice as any).findMany({
        where: {
            status: { notIn: ['PAID', 'DRAFT', 'CANCELLED'] },
            client: { autoRemindersEnabled: true }
        },
        include: { client: true, payments: true }
    })) as any[];

    for (const invoice of invoices) {
        const totalPaid = invoice.payments.reduce((acc: number, p: any) => acc + p.amount, 0);
        const remaining = invoice.total - totalPaid;
        if (remaining <= 0) continue;

        const dueDate = new Date(invoice.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let type = "";
        if (diffDays === 7) type = "PRE_J7";
        else if (diffDays === -1) type = "POST_J1";
        else if (diffDays === -7) type = "POST_J7";
        else if (diffDays === -14) type = "POST_J14";
        else if (diffDays === -30) type = "POST_J30";
        else if (diffDays < -30 && (Math.abs(diffDays) % 5 === 0)) type = `PERIODIC_J${Math.abs(diffDays)}`;

        if (type && !invoice.reminderHistory.includes(type)) {
            try {
                const content = GET_REMINDER_CONTENT(type, invoice.number);
                await sendPersonalizedEmail(invoice, remaining, content);

                await (prisma.invoice as any).update({
                    where: { id: invoice.id },
                    data: {
                        lastReminderAt: new Date(),
                        reminderHistory: { push: `${type}|${new Date().toISOString()}` }
                    }
                });
                console.log(`[SUCCÈS] ${type} pour ${invoice.number}`);
            } catch (err) {
                console.error(`[ERREUR] ${invoice.number}:`, err);
            }
        }
    }
}

async function sendPersonalizedEmail(invoice: any, remaining: number, content: ReminderContent) {
    if (!invoice.client.email) return;

    const urgencyColors = {
        low: "#0ea5e9", // Blue
        medium: "#f59e0b", // Amber
        high: "#ef4444", // Red
        critical: "#7f1d1d" // Dark Red
    };

    const html = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #f1f5f9; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <div style="background: #0f172a; padding: 40px 20px; text-align: center;">
                <div style="display: inline-block; padding: 8px 16px; background: rgba(255,255,255,0.1); border-radius: 99px; color: #fb923c; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;">
                    Makhazine ERP Cloud
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px;">${content.title}</h1>
            </div>
            
            <div style="padding: 40px;">
                <h2 style="color: #1e293b; font-size: 18px; font-weight: 800; margin-bottom: 16px;">Bonjour ${invoice.client.name},</h2>
                <p style="color: #64748b; line-height: 1.7; font-size: 15px; margin-bottom: 32px;">${content.message}</p>
                
                <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 20px; padding: 32px; margin-bottom: 32px; position: relative; overflow: hidden;">
                    <div style="position: absolute; top:0; left:0; height:100%; width:4px; background: ${urgencyColors[content.urgency]};"></div>
                    
                    <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 20px;">Récapitulatif de la Facture</div>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; color: #334155; font-size: 14px; font-weight: 700;">N° de Document</td>
                            <td style="padding: 6px 0; text-align: right; color: #1e293b; font-weight: 800;">${invoice.number}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #334155; font-size: 14px; font-weight: 700;">Date d'échéance</td>
                            <td style="padding: 6px 0; text-align: right; color: ${content.urgency === 'critical' ? '#ef4444' : '#1e293b'}; font-weight: 800;">${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</td>
                        </tr>
                        <tr style="border-top: 2px solid #e2e8f0;">
                            <td style="padding: 20px 0 0 0; color: #1e293b; font-size: 15px; font-weight: 900; text-transform: uppercase;">Total Restant</td>
                            <td style="padding: 20px 0 0 0; text-align: right; color: ${urgencyColors[content.urgency]}; font-size: 24px; font-weight: 950;">${remaining.toLocaleString()} DH</td>
                        </tr>
                    </table>
                </div>

                <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 16px; margin-bottom: 32px;">
                    <p style="color: #9a3412; font-size: 12px; font-weight: 700; margin: 0;">Si votre règlement est déjà en cours, nous vous prions de ne pas tenir compte de ce message. Vous pouvez nous envoyer la preuve de virement pour accélérer le traitement.</p>
                </div>

                <p style="color: #64748b; font-size: 13px; text-align: center;">Cordialement,<br><strong style="color: #0f172a;">Le Service Comptabilité</strong></p>
            </div>
            
            <div style="background: #f1f5f9; padding: 24px; text-align: center;">
                <p style="color: #94a3b8; font-size: 11px; margin: 0; font-weight: 600;">Email envoyé via système de gestion automatisé Makhazine.</p>
            </div>
        </div>
    `;

    if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
            from: "Makhazine <makhazine@resend.dev>",
            to: invoice.client.email,
            subject: content.subject,
            html: html
        });
    }
}

runReminders()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
