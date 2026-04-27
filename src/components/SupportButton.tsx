"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Copy } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function SupportButton() {
  const t = useTranslations("Support");

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);

    toast.custom(() => (
      <div className="bg-[#e8f7ee] text-[#2fbf6c] px-4 py-2 rounded-md shadow-sm text-sm font-medium flex items-center gap-2">
        {t("copiedToClipboard", { label })}
      </div>
    ));
  };

  const email = "support@formwise.com";
  const phone = "+33 6 12 34 56 78";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" variant="outline" size="sm">
          <LifeBuoy className="w-4 h-4 mr-2" />
          {t("getSupport")}
        </Button>
      </DialogTrigger>

      <DialogContent className="backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>{t("needHelp")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("emailLabel")}</span>
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${email}`}
                className="text-primary hover:opacity-80 cursor-pointer"
              >
                {email}
              </a>
              <Copy
                onClick={() => handleCopy(email, t("emailField"))}
                className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-black"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("phoneLabel")}</span>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${phone}`}
                className="cursor-pointer text-primary hover:opacity-80"
              >
                {phone}
              </a>
              <Copy
                onClick={() => handleCopy(phone, t("phoneField"))}
                className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-black"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
