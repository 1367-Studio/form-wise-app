"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function DashboardSuccessDialog() {
  const t = useTranslations("DashboardSuccessDialog");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const { update } = useSession();

  useEffect(() => {
    const success = searchParams?.get("success");
    if (success === "true") {
      setOpen(true);
      update().then(() => {
        const newParams = new URLSearchParams(searchParams?.toString());
        newParams.delete("success");
        router.replace(`?${newParams.toString()}`);
      });
    }
  }, [searchParams, update, router]);

  const handleRedirect = () => {
    setOpen(false);
    router.push("/dashboard/director");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground mt-2">{t("body")}</p>
        <DialogFooter className="mt-4 justify-center">
          <Button className="cursor-pointer" onClick={handleRedirect}>
            {t("goToDashboard")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
