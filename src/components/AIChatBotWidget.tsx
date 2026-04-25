"use client";

import { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function AIChatBotWidget() {
  const t = useTranslations("AIChatBot");
  const { data: session } = useSession();
  const role = session?.user?.role || "PARENT";

  const suggestions = [
    t("suggestion1"),
    t("suggestion2"),
    t("suggestion3"),
    t("suggestion4"),
  ];

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async (q?: string) => {
    const msg = q || question;
    if (!msg.trim()) return;
    setLoading(true);
    setAnswer("");
    setQuestion(q || "");

    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ role, message: msg }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setAnswer(data.answer);
    setLoading(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {open && (
          <div className="w-[360px] max-h-[520px] bg-white rounded-xl shadow-xl border flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium">{t("title")}</span>
              <button onClick={() => setOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-sm text-muted-foreground overflow-y-auto flex-1">
              {!answer && (
                <div className="bg-muted p-3 rounded-md text-sm text-gray-700">
                  {t("greeting")}
                </div>
              )}

              {answer && (
                <Textarea
                  value={answer}
                  readOnly
                  className="bg-muted-foreground/10 text-sm"
                  rows={6}
                />
              )}

              {!answer && (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((sugg, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="text-xs cursor-pointer"
                      onClick={() => handleAsk(sugg)}
                    >
                      {sugg}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t px-4 py-3 flex gap-2 items-center">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t("placeholder")}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={() => handleAsk()}
                disabled={loading}
                className="cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button
          size="icon"
          className="rounded-full shadow-lg bg-black text-white cursor-pointer hover:bg-black/80"
          onClick={() => setOpen(!open)}
        >
          <Bot className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}
