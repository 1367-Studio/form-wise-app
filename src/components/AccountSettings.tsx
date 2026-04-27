"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Settings,
  Calendar,
  Building2,
  Download,
  LogOut,
} from "lucide-react";
import CenteredSpinner from "./CenteredSpinner";
import LanguageSwitcher from "./LanguageSwitcher";
import { EnableNotificationsButton } from "./EnableNotificationsButton";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  role: string;
  civility?: string | null;
  createdAt?: string;
  tenant?: {
    name: string;
    schoolCode: string;
  } | null;
}

type Tab = "profile" | "security" | "preferences";

export default function AccountSettings() {
  const t = useTranslations("AccountSettings");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (data?.user) setUser(data.user);
      } catch (error) {
        console.log(t("loadError"), error);
        toast.error(t("loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [t]);

  if (loading) return <CenteredSpinner label={t("loading")} />;
  if (!user) return <p>{t("noUserData")}</p>;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: t("tabProfile"), icon: <User className="h-4 w-4" /> },
    { id: "security", label: t("tabSecurity"), icon: <Lock className="h-4 w-4" /> },
    {
      id: "preferences",
      label: t("tabPreferences"),
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-6 border-b border-black/10">
        <nav className="-mb-px flex flex-wrap gap-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#f84a00] text-[#f84a00]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "profile" && (
        <ProfileTab user={user} setUser={setUser} />
      )}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "preferences" && <PreferencesTab />}
    </div>
  );
}

function ProfileTab({
  user,
  setUser,
}: {
  user: UserData;
  setUser: (u: UserData) => void;
}) {
  const t = useTranslations("AccountSettings");
  const { data: session, update } = useSession();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [civility, setCivility] = useState(user.civility ?? "");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          civility: civility || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, firstName, lastName, phone, civility });
        await update({
          ...session,
          user: {
            ...session?.user,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            phone: data.user.phone,
          },
        });
        router.refresh();
        toast.success(t("infoUpdated"));
      } else {
        toast.error(data?.error || t("updateFailed"));
      }
    } catch (error) {
      console.log(t("networkError"), error);
      toast.error(t("networkError"));
    } finally {
      setUpdating(false);
    }
  };

  const initials = [user.firstName, user.lastName]
    .map((n) => n?.[0] ?? "")
    .join("")
    .toUpperCase();

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : null;

  const roleKey = `role${user.role}` as
    | "roleDIRECTOR"
    | "roleTEACHER"
    | "rolePARENT"
    | "roleSTAFF"
    | "roleSUPER_ADMIN";

  return (
    <div className="space-y-6">
      {/* Header card with avatar + meta */}
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-black text-lg font-semibold text-white">
            {initials || "·"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <Badge className="bg-[#fef1ea] text-[#f84a00] hover:bg-[#fef1ea]">
                {t(roleKey)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600">
              {memberSince && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {t("memberSince")}: {memberSince}
                </span>
              )}
              {user.tenant && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {user.tenant.name} · {user.tenant.schoolCode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editable form */}
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900">
          {t("profileTitle")}
        </h3>
        <p className="text-sm text-gray-500">{t("profileSubtitle")}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("civility")}</Label>
            <Select value={civility} onValueChange={(v) => setCivility(v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("civilityNone")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M.">{t("civilityM")}</SelectItem>
                <SelectItem value="Mme">{t("civilityMrs")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-1" />
          <div className="space-y-2">
            <Label>{t("firstName")}</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("lastName")}</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("phone")}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("emailNonEditable")}</Label>
            <Input value={user.email} disabled />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            className="cursor-pointer"
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating ? t("saving") : t("save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const t = useTranslations("AccountSettings");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error(t("passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordsNoMatch"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(t("passwordChanged"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data?.error || t("updateFailed"));
      }
    } catch {
      toast.error(t("networkError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOutAll = async () => {
    setSigningOutAll(true);
    try {
      const res = await fetch("/api/me/sign-out-all", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || t("updateFailed"));
        return;
      }
      toast.success(t("signOutAllSuccess"));
      await signOut({ callbackUrl: "/login" });
    } catch {
      toast.error(t("networkError"));
    } finally {
      setSigningOutAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-black/10 bg-white p-6"
      >
        <h3 className="text-base font-semibold text-gray-900">
          {t("securityTitle")}
        </h3>
        <p className="text-sm text-gray-500">{t("securitySubtitle")}</p>

        <div className="mt-6 grid gap-4 max-w-md">
          <div className="space-y-2">
            <Label>{t("currentPassword")}</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{t("newPassword")}</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("confirmPassword")}</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" className="cursor-pointer" disabled={submitting}>
            {submitting ? t("changingPassword") : t("changePassword")}
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-black/10 bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900">
          {t("signOutAllTitle")}
        </h3>
        <p className="text-sm text-gray-500">{t("signOutAllSubtitle")}</p>
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={handleSignOutAll}
            disabled={signingOutAll}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {signingOutAll ? t("signingOutAll") : t("signOutAllButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PreferencesTab() {
  const t = useTranslations("AccountSettings");
  const tGdpr = useTranslations("GdprExport");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/me/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `formwise-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900">
          {t("preferencesTitle")}
        </h3>
        <p className="text-sm text-gray-500">{t("preferencesSubtitle")}</p>
        <div className="mt-6 flex items-center justify-between max-w-md">
          <Label>{t("languageLabel")}</Label>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900">
          {t("notificationsTitle")}
        </h3>
        <p className="text-sm text-gray-500">{t("notificationsSubtitle")}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 max-w-md">
          <Label>{t("notificationsLabel")}</Label>
          <EnableNotificationsButton />
        </div>
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900">
          {tGdpr("title")}
        </h3>
        <p className="text-sm text-gray-500">{tGdpr("subtitle")}</p>
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? tGdpr("downloading") : tGdpr("downloadButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
