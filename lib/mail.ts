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
