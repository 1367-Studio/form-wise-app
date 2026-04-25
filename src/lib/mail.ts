import { resend } from "./resend";

export async function sendValidationEmail(
  to: string,
  childFirstName: string,
  decision: "ACCEPTED" | "REJECTED"
) {
  const statusText = decision === "ACCEPTED" ? "acceptée" : "refusée";
  const subject = `Préinscription ${statusText}`;
  const message = `Bonjour, la préinscription de ${childFirstName} a été ${statusText}.`;

  await resend.emails.send({
    from: "Formwise <noreply@formwise.app>",
    to,
    subject,
    html: `<p>${message}</p>`,
  });
}
