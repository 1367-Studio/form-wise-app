// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { resend } from "../../../lib/resend";
import { z } from "zod";

// Validation schema
const contactSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  role: z.string().optional(),
  subject: z
    .string()
    .min(1, "Le sujet est requis")
    .max(200, "Le sujet est trop long"),
  message: z
    .string()
    .min(1, "Le message doit contenir au moins 10 caractères")
    .max(1000, "Le message est trop long"),
});

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const limit = 5; // 5 requests per window

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count++;
  return false;
}

// Sanitize HTML content
function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\n/g, "<br>");
}

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer dans 15 minutes." },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await req.json();

    const validatedData = contactSchema.parse(body);

    const { name, email, phone, role, subject, message } = validatedData;

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY n'est pas configurée");
      return NextResponse.json(
        { error: "Configuration serveur manquante" },
        { status: 500 }
      );
    }

    // Send email
    const emailResult = await resend.emails.send({
      from: "Formwise <onboarding@formwise.fr>",
      to: "leobarbosacontact@gmail.com",
      subject: `📥 Nouveau message via formulaire - ${subject || "Sans sujet"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Nouveau message de contact
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nom:</strong> ${sanitizeHtml(name)}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${sanitizeHtml(email)}</a></p>
            ${phone ? `<p><strong>Téléphone:</strong> ${sanitizeHtml(phone)}</p>` : ""}
            ${role ? `<p><strong>Rôle:</strong> ${sanitizeHtml(role)}</p>` : ""}
            ${subject ? `<p><strong>Sujet:</strong> ${sanitizeHtml(subject)}</p>` : ""}
          </div>
          
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #555;">${sanitizeHtml(message)}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>Message reçu le ${new Date().toLocaleString("fr-FR")}</p>
            <p>IP: ${ip}</p>
          </div>
        </div>
      `,
    });

    // Log successful submission (without sensitive data)
    console.log(
      `Message de contact envoyé avec succès. ID: ${emailResult.data?.id}`
    );

    return NextResponse.json({
      success: true,
      message: "Votre message a été envoyé avec succès !",
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle Resend API errors
    if (error && typeof error === "object" && "message" in error) {
      console.error("Erreur Resend API:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    // Generic error handling
    console.error("Erreur inattendue:", error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite" },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
}
