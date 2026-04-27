"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { useTranslations } from "next-intl";
import { PreRegistrationFormData } from "./schemas/preRegistration";

interface ChildFormProps {
  index: number;
  registerAction: UseFormRegister<PreRegistrationFormData>;
}

export default function ChildForm({ index, registerAction }: ChildFormProps) {
  const t = useTranslations("Preinscription");
  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-white">
        {t("studentN", { n: index + 1 })}
      </h4>

      <div className="space-y-2">
        <Label htmlFor={`children.${index}.firstName`} className="text-white">
          {t("childFirstName")}
        </Label>
        <Input
          className="bg-white text-black"
          id={`children.${index}.firstName`}
          {...registerAction(`children.${index}.firstName`)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`children.${index}.lastName`} className="text-white">
          {t("childLastName")}
        </Label>
        <Input
          className="bg-white text-black"
          id={`children.${index}.lastName`}
          {...registerAction(`children.${index}.lastName`)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`children.${index}.gender`} className="text-white">
          {t("childGender")}
        </Label>
        <select
          id={`children.${index}.gender`}
          {...registerAction(`children.${index}.gender`)}
          className="w-full border rounded-md p-2 bg-white text-black"
        >
          <option value="FILLE">{t("childGenderGirl")}</option>
          <option value="GARÇON">{t("childGenderBoy")}</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`children.${index}.birthDate`} className="text-white">
          {t("childBirthDate")}
        </Label>
        <Input
          type="date"
          className="bg-white text-black"
          id={`children.${index}.birthDate`}
          {...registerAction(`children.${index}.birthDate`)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`children.${index}.birthCity`} className="text-white">
          {t("childBirthCity")}
        </Label>
        <Input
          className="bg-white text-black"
          id={`children.${index}.birthCity`}
          {...registerAction(`children.${index}.birthCity`)}
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor={`children.${index}.birthCountry`}
          className="text-white"
        >
          {t("childBirthCountry")}
        </Label>
        <Input
          className="bg-white text-black"
          id={`children.${index}.birthCountry`}
          {...registerAction(`children.${index}.birthCountry`)}
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor={`children.${index}.currentSchool`}
          className="text-white"
        >
          {t("childCurrentSchool")}
        </Label>
        <Input
          className="bg-white text-black"
          id={`children.${index}.currentSchool`}
          {...registerAction(`children.${index}.currentSchool`)}
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor={`children.${index}.desiredClass`}
          className="text-white"
        >
          {t("childDesiredClass")}
        </Label>
        <Input
          className="bg-white text-black"
          id={`children.${index}.desiredClass`}
          {...registerAction(`children.${index}.desiredClass`)}
        />
      </div>
    </div>
  );
}
