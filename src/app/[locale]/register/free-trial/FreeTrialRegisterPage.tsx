"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function FreeTrialRegisterPage() {
  const t = useTranslations("FreeTrial");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    schoolName: "",
    phone: "",
    address: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/register/free-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/register/thank-you");
      } else {
        const data = await res.json();
        alert(data.error || tCommon("errorGeneric"));
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      alert(tCommon("networkError"));
    }
  };

  return (
    <div className="flex min-h-full flex-1">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link href="/" aria-label="formwise">
            <Logo />
          </Link>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
            {t("formTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="space-y-2">
              <Label>{t("firstNameLabel")}</Label>
              <Input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t("lastNameLabel")}</Label>
              <Input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t("schoolNameLabel")}</Label>
              <Input
                name="schoolName"
                value={form.schoolName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t("phoneLabel")}</Label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t("addressLabel")}</Label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t("emailLabel")}</Label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-4 cursor-pointer">
              {t("startTrialButton")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline cursor-pointer"
            >
              {t("signinLink")}
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 my-auto -m-2 flex items-center justify-center rounded-xl bg-white-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
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
