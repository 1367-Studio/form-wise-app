"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { PhoneInputField } from "@/components/ui/phoneInputField";
import { Building2, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";

// --------------------------
// INTERFACES
// --------------------------
interface SchoolRegisterForm {
  firstName: string;
  lastName: string;
  schoolName: string;
  email: string;
  phone: string | null;
  address: string | null;
  postal: string | null;
  city: string | null;
  country: string | null;
  landlinePhone: string | null;
  siret: string;
}

interface Field {
  label: string;
  name: keyof SchoolRegisterForm;
  type?: string;
}

// --------------------------
// PHONE VALIDATION
// --------------------------
const isValidPhone = (value?: string | null) => {
  if (!value || value.trim() === "") return true;
  const v = value.trim();
  if (/^\+\d{1,4}$/.test(v)) return true;
  return /^\+\d{1,4}\d{6,14}$/.test(v);
};

// --------------------------
// ZOD SCHEMA
// --------------------------
const schema = z.object({
  firstName: z.string().min(3, "Le prénom est obligatoire."),
  lastName: z.string().min(3, "Le nom est obligatoire."),
  schoolName: z.string().min(3, "Le nom de l’établissement est obligatoire."),
  email: z.string().email("Adresse e-mail invalide."),
  phone: z
    .string()
    .optional()
    .nullable()
    .refine(
      isValidPhone,
      "Numéro de téléphone invalide. Utilisez un format international, ex : +33612345678."
    ),
  address: z.string().optional().nullable(),
  postal: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  landlinePhone: z
    .string()
    .optional()
    .nullable()
    .refine(
      isValidPhone,
      "Numéro de téléphone fixe invalide. Utilisez un format international."
    ),
  siret: z.string().min(14, "Le SIRET doit contenir 14 chiffres."),
});

// --------------------------
// FIELDS CONFIG
// --------------------------
const fields: { title: string; icon: React.ReactNode; items: Field[] }[] = [
  {
    title: "Responsable de l’établissement",
    icon: <Building2 size={18} />,
    items: [
      { label: "Nom", name: "lastName" },
      { label: "Prénom", name: "firstName" },
      { label: "Numéro portable", name: "phone" },
      { label: "Numéro fixe", name: "landlinePhone" },
      { label: "Email", name: "email", type: "email" },
    ],
  },
  {
    title: "Adresse",
    icon: <MapPin size={18} />,
    items: [
      { label: "Rue", name: "address" },
      { label: "Code postal", name: "postal" },
      { label: "Ville", name: "city" },
      { label: "Pays", name: "country" },
    ],
  },
  {
    title: "Informations de l’école",
    icon: <FileText size={18} />,
    items: [
      { label: "Nom de l’établissement", name: "schoolName" },
      { label: "SIRET", name: "siret" },
    ],
  },
];

// --------------------------
// COMPONENT
// --------------------------
export default function InternalSchoolRegisterPage() {
  const [form, setForm] = useState<SchoolRegisterForm>({
    firstName: "",
    lastName: "",
    schoolName: "",
    email: "",
    phone: "",
    address: "",
    postal: "",
    city: "",
    country: "",
    landlinePhone: "",
    siret: "",
  });

  const [errors, setErrors] = useState<
    Record<keyof SchoolRegisterForm, string>
  >({} as Record<keyof SchoolRegisterForm, string>);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement & { name: keyof SchoolRegisterForm }>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const parsed = schema.safeParse(form);

    if (!parsed.success) {
      const zodErrors = {} as Record<keyof SchoolRegisterForm, string>;
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SchoolRegisterForm;
        zodErrors[field] = issue.message;
      });
      setErrors(zodErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/superadmin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(
          "École créée avec succès et directeur ajouté. Les identifiants ont été envoyés par e-mail.",
          { duration: 5000 }
        );
        setForm({
          firstName: "",
          lastName: "",
          schoolName: "",
          email: "",
          phone: "",
          address: "",
          postal: "",
          city: "",
          country: "",
          landlinePhone: "",
          siret: "",
        });
        return;
      }

      const data = await res.json();
      if (data.errors) {
        const backendErrors = {} as Record<keyof SchoolRegisterForm, string>;
        for (const err of data.errors) {
          backendErrors[err.field as keyof SchoolRegisterForm] = err.message;
        }
        setErrors(backendErrors);
      } else {
        alert("Une erreur est survenue.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-24 min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Inscription interne d’établissement
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((section) => (
            <div key={section.title} className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                {section.icon}
                <span>{section.title}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {section.items.map((field) => (
                  <div key={field.name} className="space-y-1">
                    <Label>{field.label}</Label>

                    {field.name === "phone" ||
                    field.name === "landlinePhone" ? (
                      <PhoneInputField
                        value={form[field.name] ?? undefined}
                        onChange={(value) =>
                          setForm((prev) => ({ ...prev, [field.name]: value }))
                        }
                        placeholder={field.label}
                      />
                    ) : (
                      <Input
                        type={field.type || "text"}
                        name={field.name}
                        value={form[field.name] ?? ""}
                        onChange={handleChange}
                      />
                    )}

                    {errors[field.name] && (
                      <p className="text-sm text-red-600">
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Enregistrement en cours..."
                : "Enregistrer l'école et le directeur →"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
