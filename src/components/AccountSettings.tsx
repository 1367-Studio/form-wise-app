"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import CenteredSpinner from "./CenteredSpinner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserData {
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
}

export default function AccountSettings() {
  const t = useTranslations("AccountSettings");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: session, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          setFirstName(data.user.firstName || "");
          setLastName(data.user.lastName || "");
          setPhone(data.user.phone || "");
        }
      } catch (error) {
        console.log(t("loadError"), error);
        toast.error(t("loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [t]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser((prev) =>
          prev ? { ...prev, firstName, lastName, phone } : null
        );

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

  if (loading) return <CenteredSpinner label={t("loading")} />;
  if (!user) return <p>{t("noUserData")}</p>;

  return (
    <div className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium">{t("firstName")}</label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">{t("lastName")}</label>
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium">{t("phone")}</label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium">
          {t("emailNonEditable")}
        </label>
        <Input value={user.email} disabled />
      </div>

      <Button
        className="cursor-pointer"
        onClick={handleUpdate}
        disabled={updating}
      >
        {updating ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
