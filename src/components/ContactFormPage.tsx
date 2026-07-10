"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { AsteriskIcon } from "@phosphor-icons/react";

export default function ContactFormPage() {
  const t = useTranslations("ContactForm");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    subject: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(t("successMessage"));
        setFormData({
          role: "",
          subject: "",
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        toast.error(t("errorMessage"));
      }
    } catch (error) {
      console.log(error);
      toast.error(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  // Outlined fields: transparent (black) background, light-grey borders,
  // white text and white placeholders — the field name acts as the label.
  const fieldClass =
    "h-14 rounded-lg border-white/25 bg-transparent px-4 text-base text-white placeholder:text-white/55 focus-visible:border-white/50 focus-visible:ring-0 md:text-base";
  const selectClass =
    "h-14 w-full rounded-lg border-white/25 bg-transparent px-4 text-base text-white data-[placeholder]:text-white/55 data-[size=default]:h-14 focus-visible:border-white/50 focus-visible:ring-0 md:text-base";

  return (
    <section className="min-h-screen bg-black pb-24 pt-40 text-white sm:pt-48">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 lg:grid-cols-[1.5fr_0.8fr] lg:gap-16 lg:px-8">
        {/* Left — title + form */}
        <div>
          <h1 className="max-w-xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>

          <form onSubmit={handleSubmit} className="mt-12 lg:mt-16">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                aria-label={t("nameLabel")}
                placeholder={t("nameLabel")}
                className={fieldClass}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
              <Input
                aria-label={t("emailLabel")}
                type="email"
                placeholder={t("emailLabel")}
                className={fieldClass}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
              <Input
                aria-label={t("phoneLabel")}
                placeholder={t("phoneLabel")}
                className={fieldClass}
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
              <Select
                value={formData.role}
                onValueChange={(val) => handleChange("role", val)}
              >
                <SelectTrigger aria-label={t("iAmLabel")} className={selectClass}>
                  <SelectValue placeholder={t("iAmLabel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">{t("profileParent")}</SelectItem>
                  <SelectItem value="directeur">
                    {t("profileDirector")}
                  </SelectItem>
                  <SelectItem value="association">
                    {t("profileAssociation")}
                  </SelectItem>
                  <SelectItem value="autre">{t("profileOther")}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.subject}
                onValueChange={(val) => handleChange("subject", val)}
              >
                <SelectTrigger
                  aria-label={t("subjectLabel")}
                  className={`${selectClass} sm:col-span-2`}
                >
                  <SelectValue placeholder={t("subjectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={t("subjectOffer")}>
                    {t("subjectOffer")}
                  </SelectItem>
                  <SelectItem value={t("subjectInfo")}>
                    {t("subjectInfo")}
                  </SelectItem>
                  <SelectItem value={t("subjectSupport")}>
                    {t("subjectSupport")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                aria-label={t("messageLabel")}
                placeholder={t("messageLabel")}
                className="min-h-44 rounded-lg border-white/25 bg-transparent px-4 py-3 text-base text-white placeholder:text-white/55 focus-visible:border-white/50 focus-visible:ring-0 sm:col-span-2"
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                required
                rows={6}
              />

              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full cursor-pointer rounded-lg bg-white px-10 text-xs font-semibold uppercase tracking-wider text-black hover:bg-white/90 sm:w-auto"
                >
                  {loading ? t("sending") : t("sendButton")}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Right — contact info */}
        <div className="lg:border-l lg:border-white/15 lg:pl-12">
          <AsteriskIcon
            aria-hidden="true"
            weight="bold"
            className="h-12 w-12 text-white"
          />

          <div className="mt-10 space-y-8 text-sm">
            <div>
              <p className="font-semibold text-white">Marseille, France</p>
              <p className="mt-2 leading-relaxed text-white/60">
                11 Rue Étienne Henry Gouin,
                <br />
                13011 Marseille
              </p>
            </div>

            <div>
              <p className="font-semibold text-white">Email</p>
              <a
                href="mailto:formwisecontact@gmail.com"
                className="mt-2 inline-block text-white/70 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
              >
                formwisecontact@gmail.com
              </a>
            </div>

            <div>
              <p className="font-semibold text-white">Instagram</p>
              <a
                href="https://www.instagram.com/formwise.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-white/70 transition-colors hover:text-white"
              >
                @formwise.fr
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
