import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

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
    subject: "Bienvenue sur Formwise – Votre compte est prêt",
    html: `
      <p>Bonjour ${name},</p>
      <p>Votre compte a été créé avec succès. Voici vos accès :</p>
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

export async function sendEmailForDeniedRequest({
  to,
  name,
  reason,
}: {
  to: string;
  name: string;
  reason: string;
}) {
  const result = await resend.emails.send({
    from: "Formwise <onboarding@formwise.fr>",
    to,
    subject: "Formwise – Votre demande a été refusée",
    html: `
      <p>Bonjour ${name},</p>
      <p>Nous vous informons que votre demande a été refusée.</p>
      <p><strong>Raison :</strong> ${reason}</p>
      <p>Si vous avez des questions, veuillez nous contacter.</p>
      <p>À bientôt,</p>
      <p>L’équipe Formwise</p>
    `,
  });

  return result;
}
