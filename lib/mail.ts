import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
    const confirmLink = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

    await resend.emails.send({
        from: "onboarding@resend.dev", // Replace with your domain in production
        to: email,
        subject: "Vérifiez votre email - ERP SaaS",
        html: `<p>Cliquez sur le lien suivant pour vérifier votre adresse email : <a href="${confirmLink}">Vérifier maintenant</a></p>`,
    });
}

export async function sendAdminNotification(userData: any) {
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "admin@example.com", // Replace with real admin email
        subject: "Nouvelle inscription ERP SaaS",
        html: `
      <h2>Nouvelle inscription en attente</h2>
      <p><strong>Nom:</strong> ${userData.name}</p>
      <p><strong>Email:</strong> ${userData.email}</p>
      <p><strong>Société:</strong> ${userData.companyName}</p>
      <p><strong>ICE:</strong> ${userData.ice}</p>
      <p>Veuillez vous connecter à l'espace admin pour valider ce compte.</p>
    `,
    });
}

export async function sendDocumentEmail(to: string, subject: string, message: string, filename: string, base64Data: string) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("Clé API d'envoi d'email non configurée");
    }

    // Convert data URI (data:application/pdf;base64,xxxx) to pure base64 string
    const base64Content = base64Data.split('base64,')[1] || base64Data;

    await resend.emails.send({
        from: "onboarding@resend.dev", // Note: Replace in prod or it limits to verified emails
        to: to,
        subject: subject,
        html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${message}</div>`,
        attachments: [
            {
                filename: filename,
                content: base64Content,
            }
        ]
    });
}

export async function sendReminderEmail(to: string, subject: string, html: string) {
    if (!process.env.RESEND_API_KEY) return;
    await resend.emails.send({
        from: "makhazine@resend.dev",
        to: to,
        subject: subject,
        html: html,
    });
}
