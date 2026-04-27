"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ParentForm from "./ParentForm";
import ChildForm from "./ChildForm";
import FileUpload from "./FileUpload";
import { useRouter } from "next/navigation";
import {
  preRegistrationSchema,
  PreRegistrationFormData,
} from "./schemas/preRegistration";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PreRegistrationForm({
  schoolCode,
}: {
  schoolCode: string;
}) {
  const t = useTranslations("Preinscription");
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<PreRegistrationFormData>({
    resolver: zodResolver(preRegistrationSchema),
    defaultValues: {
      parent: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
      },
      children: [
        {
          firstName: "",
          lastName: "",
          gender: "FILLE",
          birthDate: "",
          birthCity: "",
          birthCountry: "",
          currentSchool: "",
          desiredClass: "",
        },
      ],
      uploadedFiles: {
        motivationLetterUrl: null,
        schoolResultsUrl: null,
        familyBookUrl: null,
      },
    },
  });

  const { fields, append } = useFieldArray({ control, name: "children" });

  const onSubmit = async (data: PreRegistrationFormData) => {
    const payload = { ...data, schoolCode };

    const res = await fetch("/api/preinscriptions", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      toast.success(t("successMessage"));
      reset();
      setTimeout(() => {
        router.push("/preinscription-success");
      }, 1500);
    } else {
      toast.error(t("errorMessage"));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-bold text-center">{t("formTitle")}</h2>

      <ParentForm registerAction={register} />

      <div className="space-y-4 bg-[#0f172b] p-8 rounded">
        <h3 className="font-bold text-lg text-white">{t("studentsTitle")}</h3>
        <Accordion type="multiple" defaultValue={["child-0"]}>
          {fields.map((field, index) => (
            <AccordionItem key={field.id} value={`child-${index}`}>
              <AccordionTrigger className="text-white">
                {t("studentN", { n: index + 1 })}
              </AccordionTrigger>
              <AccordionContent>
                <ChildForm index={index} registerAction={register} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Button
          type="button"
          className="cursor-pointer"
          onClick={() =>
            append({
              firstName: "",
              lastName: "",
              gender: "FILLE",
              birthDate: "",
              birthCity: "",
              birthCountry: "",
              currentSchool: "",
              desiredClass: "",
            })
          }
        >
          <Plus /> {t("addAnotherStudent")}
        </Button>
      </div>

      <FileUpload
        onUploadCompleteAction={(urls) => setValue("uploadedFiles", urls)}
      />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full cursor-pointer"
      >
        {isSubmitting ? t("submitting") : t("submitButton")}
      </Button>
    </form>
  );
}
