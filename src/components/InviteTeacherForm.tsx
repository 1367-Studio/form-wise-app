"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, User, GraduationCap, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

type ClassOption = { id: string; name: string };
type SubjectOption = { id: string; name: string; classId: string };

const NONE = "none";

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function isValidPhone(s: string) {
  // Allow +country, digits, spaces, dashes, dots, parens. 8–20 chars after stripping.
  const stripped = s.replace(/[^\d+]/g, "");
  return stripped.length >= 8 && stripped.length <= 20;
}

export default function InviteTeacherForm({
  onInvited,
}: {
  onInvited?: () => void;
}) {
  const t = useTranslations("InviteTeacherForm");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [classId, setClassId] = useState<string>(NONE);
  const [subjectId, setSubjectId] = useState<string>(NONE);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const isDirty =
    !loading &&
    (firstName !== "" ||
      lastName !== "" ||
      email !== "" ||
      phone !== "" ||
      classId !== NONE ||
      subjectId !== NONE);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch("/api/classes/overview"),
          fetch("/api/subjects"),
        ]);
        const cJson = await cRes.json().catch(() => ({}));
        const sJson = await sRes.json().catch(() => ({}));
        setClasses(
          Array.isArray(cJson?.classes)
            ? cJson.classes.map((c: { id: string; name: string }) => ({
                id: c.id,
                name: c.name,
              }))
            : []
        );
        setSubjects(
          Array.isArray(sJson?.subjects)
            ? sJson.subjects.map(
                (s: {
                  id: string;
                  name: string;
                  class?: { id?: string };
                  classId?: string;
                }) => ({
                  id: s.id,
                  name: s.name,
                  classId: s.class?.id ?? s.classId ?? "",
                })
              )
            : []
        );
      } catch {
        // ignore — pickers will show empty state
      }
    };
    load();
  }, []);

  const subjectOptions = useMemo(
    () =>
      classId !== NONE ? subjects.filter((s) => s.classId === classId) : [],
    [subjects, classId]
  );

  const emailErr = email && !isValidEmail(email) ? t("invalidEmail") : null;
  const phoneErr = phone && !isValidPhone(phone) ? t("invalidPhone") : null;
  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    isValidEmail(email) &&
    isValidPhone(phone) &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch("/api/invite-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          classId: classId !== NONE ? classId : undefined,
          subjectId: subjectId !== NONE ? subjectId : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        toast.success(t("successInvited", { email }));
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setClassId(NONE);
        setSubjectId(NONE);
        onInvited?.();
      } else {
        toast.error(data?.error || t("errorGeneric"));
      }
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-black/10 bg-white p-6 max-w-2xl"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fef1ea] text-[#f84a00]">
          <Mail className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {t("title")}
          </h2>
          <p className="text-xs text-gray-500">{t("subtitle")}</p>
        </div>
      </div>

      <Section icon={<User className="h-3.5 w-3.5" />} label={t("sectionPersonal")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">{t("firstNameLabel")}</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t("firstNamePlaceholder")}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("lastNameLabel")}</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t("lastNamePlaceholder")}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("emailLabel")}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prof@ecole.fr"
              className={
                emailErr
                  ? "border-red-300 focus-visible:ring-red-300"
                  : ""
              }
              required
            />
            {emailErr && (
              <p className="text-[11px] text-red-600">{emailErr}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {t("phoneLabel")}
            </Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className={
                phoneErr
                  ? "border-red-300 focus-visible:ring-red-300"
                  : ""
              }
              required
            />
            {phoneErr && (
              <p className="text-[11px] text-red-600">{phoneErr}</p>
            )}
          </div>
        </div>
      </Section>

      <Section
        icon={<GraduationCap className="h-3.5 w-3.5" />}
        label={t("sectionAssignment")}
        hint={t("sectionAssignmentHint")}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">{t("classLabel")}</Label>
            <Select
              value={classId}
              onValueChange={(v) => {
                setClassId(v);
                setSubjectId(NONE);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("classPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("noneOption")}</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("subjectLabel")}</Label>
            <Select
              value={subjectId}
              onValueChange={setSubjectId}
              disabled={classId === NONE || subjectOptions.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    classId === NONE
                      ? t("subjectDisabled")
                      : subjectOptions.length === 0
                        ? t("subjectEmpty")
                        : t("subjectPlaceholder")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("noneOption")}</SelectItem>
                {subjectOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-black/5 pt-4">
        <p className="text-xs text-gray-500">{t("emailWillBeSent")}</p>
        <Button type="submit" disabled={!canSubmit} className="cursor-pointer">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {loading ? t("sending") : t("submitButton")}
        </Button>
      </div>
    </form>
  );
}

function Section({
  icon,
  label,
  hint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        {icon}
        {label}
        {hint && <span className="ml-1 text-[10px] normal-case font-normal text-gray-400">· {hint}</span>}
      </div>
      {children}
    </div>
  );
}
