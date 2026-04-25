import { resend } from "./resend";

export async function sendEmailWithTempPassword({
  to,
  name,
  password,
}: {
  to: string;
  name: string;
  password: string;
}) {
  const result = await resend.emails.send({
    from: "Formwise <onboarding@formwise.fr>",
    to,
    subject: "Bienvenue sur Formwise – Essai gratuit activé",
    html: `
      <p>Bonjour ${name},</p>
      <p>Votre essai gratuit de 20 jours est actif. Voici vos accès :</p>
      <ul>
        <li><strong>Email :</strong> ${to}</li>
        <li><strong>Mot de passe temporaire :</strong> ${password}</li>
      </ul>
      <p>Connectez-vous ici : <a href="https://formwise.fr/login">formwise.fr/login</a></p>
      <p>À bientôt,</p>
      <p>L’équipe Formwise</p>
    `,
  });

  return result;
}
