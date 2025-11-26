"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Building2, FileText, MapPin, Zap } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { PhoneInputField } from "@/components/ui/phoneInputField";

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

interface StepField {
  label: string;
  name: keyof SchoolRegisterForm;
  type?: string;
}

interface StepItem {
  title: string;
  icon: JSX.Element;
  fields: StepField[];
}

interface BackendError {
  field: keyof SchoolRegisterForm;
  message: string;
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
// FORM STEPS CONFIG (TYPED)
// --------------------------
const steps: StepItem[] = [
  {
    title: "Responsable de l’établissement",
    icon: <Building2 size={18} />,
    fields: [
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
    fields: [
      { label: "Rue", name: "address" },
      { label: "Code postal", name: "postal" },
      { label: "Ville", name: "city" },
      { label: "Pays", name: "country" },
    ],
  },

  {
    title: "Informations de l’école",
    icon: <FileText size={18} />,
    fields: [
      { label: "Nom de l’établissement", name: "schoolName" },
      { label: "SIRET", name: "siret" },
    ],
  },
];

export default function SchoolRegisterPage() {
  const router = useRouter();

  // --------------------------
  // FORM STATE
  // --------------------------
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

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --------------------------
  // GET STEP OF FIELD
  // --------------------------
  const getStepIndexForField = (fieldName: keyof SchoolRegisterForm) => {
    const index = steps.findIndex((s) =>
      s.fields.some((f) => f.name === fieldName)
    );
    return index >= 0 ? index : 0;
  };

  // --------------------------
  // HANDLE CHANGE
  // --------------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement & { name: keyof SchoolRegisterForm }>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // --------------------------
  // VALIDATE STEP
  // --------------------------
  const validateStep = () => {
    const currentFields = steps[step].fields.map((f) => f.name);

    const partialSchema = schema.pick(
      Object.fromEntries(currentFields.map((f) => [f, true])) as Record<
        keyof SchoolRegisterForm,
        true
      >
    );

    const result = partialSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = {} as Record<keyof SchoolRegisterForm, string>;
      result.error.issues.forEach((i) => {
        const field = i.path[0] as keyof SchoolRegisterForm;
        fieldErrors[field] = i.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    return true;
  };

  // --------------------------
  // STEP NAVIGATION
  // --------------------------
  const nextStep = () => {
    if (!validateStep()) return;
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  // --------------------------
  // SUBMIT
  // --------------------------
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

      const stepIndices = parsed.error.issues.map((issue) =>
        getStepIndexForField(issue.path[0] as keyof SchoolRegisterForm)
      );

      setStep(Math.min(...stepIndices));
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/register/school-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/register/thank-you");
        return;
      }

      const data = await res.json();

      if (data.errors) {
        const backendErrors = {} as Record<keyof SchoolRegisterForm, string>;

        for (const err of data.errors) {
          backendErrors[err.field as keyof SchoolRegisterForm] = err.message;
        }

        setErrors(backendErrors);

        const fieldsWithErrors: (keyof SchoolRegisterForm)[] = (
          data.errors as BackendError[]
        ).map((err) => err.field);

        const stepIndices = fieldsWithErrors.map((field) =>
          getStepIndexForField(field)
        );

        setStep(Math.min(...stepIndices));
      } else {
        alert("Une erreur est survenue.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------
  // RENDER
  // --------------------------
  return (
    <div className="flex min-h-full flex-1">
      {/* LEFT PANEL */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link href="/" className="flex justify-center items-center gap-2">
            <Zap className="text-gray-900" />
            <h1 className="text-xl font-bold text-gray-900">Formwise</h1>
          </Link>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
            Inscrivez votre établissement gratuitement
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Aucune carte bancaire requise.
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {/* STEP INDICATOR */}
            <div className="flex justify-between mb-6 select-none">
              {steps.map((s, i) => {
                const isActive = i === step;
                const isCompleted = i < step;

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-center h-full"
                  >
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-200
                      ${
                        isActive
                          ? "border-indigo-700 bg-indigo-100 text-indigo-700"
                          : ""
                      }
                      ${
                        isCompleted
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : ""
                      }
                      ${
                        !isActive && !isCompleted
                          ? "border-gray-300 bg-gray-100 text-gray-400"
                          : ""
                      }`}
                    >
                      {s.icon}
                    </div>

                    <span
                      className={`mt-2 text-xs font-medium text-center
                      ${isActive ? "text-indigo-700" : ""}
                      ${isCompleted ? "text-gray-500" : ""}
                      ${!isActive && !isCompleted ? "text-gray-500" : ""}`}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* STEP FIELDS */}
            <div className="border rounded-lg p-4 sm:p-6 shadow-sm bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {steps[step].title}
              </h3>

              <div className="space-y-6">
                {steps[step].fields.map((field) => (
                  <div className="space-y-1.5" key={field.name}>
                    <Label>{field.label}</Label>

                    {field.name === "phone" ||
                    field.name === "landlinePhone" ? (
                      <PhoneInputField
                        value={form[field.name] ?? undefined}
                        onChange={(value) => {
                          setForm((prev) => ({ ...prev, [field.name]: value }));
                          setErrors((prev) => ({
                            ...prev,
                            [field.name]: "",
                          }));
                        }}
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

            {/* BUTTONS */}
            <div className="flex justify-between mt-6">
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Retour
                </Button>
              ) : (
                <div></div>
              )}

              {step < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Suivant →
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Envoi en cours..."
                    : "Envoyer pour approbation →"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Image
            alt="Formwise illustration"
            src="https://cdn.sanity.io/media-libraries/mllo1PEUbcwG/images/1a193e97e1f8408d64ecf8c4304687d2b513748f-5104x2528.png"
            width={1500}
            height={1598}
            className="rounded-md shadow-2xl ring-1 ring-gray-900/10 object-contain max-h-[90vh]"
          />
        </div>
      </div>
    </div>
  );
}
