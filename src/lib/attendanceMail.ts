import { resend } from "./resend";

type Status = "ABSENT" | "LATE";

const subjectByStatus: Record<Status, string> = {
  ABSENT: "Absence signalée",
  LATE: "Retard signalé",
};

const verbByStatus: Record<Status, string> = {
  ABSENT: "absent(e)",
  LATE: "en retard",
};

export async function sendAbsenceEmail(opts: {
  to: string;
  childFirstName: string;
  childLastName: string;
  dateLabel: string;
  schoolName: string | null;
  status: Status;
  classLabel: string | null;
}) {
  const fullName = `${opts.childFirstName} ${opts.childLastName}`.trim();
  const subject = `${subjectByStatus[opts.status]} — ${fullName}`;
  const schoolLine = opts.schoolName ? ` à ${opts.schoolName}` : "";
  const classLine = opts.classLabel ? ` (${opts.classLabel})` : "";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background:#EFF6FF;border:1px solid rgba(37,99,235,0.2);border-radius:12px;padding:16px;margin-bottom:16px;">
        <p style="margin:0;color:#1E3A8A;font-size:14px;font-weight:600;">${subjectByStatus[opts.status]}</p>
      </div>
      <p style="font-size:15px;color:#111;">Bonjour,</p>
      <p style="font-size:15px;color:#111;line-height:1.6;">
        <strong>${fullName}</strong>${classLine} a été marqué(e) <strong>${verbByStatus[opts.status]}</strong>${schoolLine} pour la journée du <strong>${opts.dateLabel}</strong>.
      </p>
      <p style="font-size:14px;color:#555;line-height:1.6;">
        Si cette absence est justifiée, vous pouvez ajouter une note (et un justificatif) depuis votre espace Formwise.
      </p>
      <p style="margin-top:24px;font-size:12px;color:#888;">
        — Cet email est envoyé automatiquement par Formwise. Ne répondez pas directement à cet email.
      </p>
    </div>
  `.trim();

  try {
    await resend.emails.send({
      from: "Formwise <noreply@formwise.app>",
      to: opts.to,
      subject,
      html,
    });
  } catch (e) {
    console.error("absence email failed:", e);
  }
}
