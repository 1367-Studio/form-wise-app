"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format, formatDistanceToNow } from "date-fns";
import { fr, enGB, ptBR, es } from "date-fns/locale";
import {
  Plus,
  Trash2,
  Edit3,
  UserCheck,
  Phone,
  Clock,
  LogIn,
  LogOut,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SectionSkeleton } from "./SectionSkeleton";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useOptionalSelectedChild } from "@/contexts/SelectedChildContext";

const dateLocales = { fr, en: enGB, pt: ptBR, es } as const;

type Authorization = {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string | null;
  phone: string | null;
  notes: string | null;
  photoUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PickupEvent = {
  id: string;
  type: "ENTRY" | "EXIT";
  occurredAt: string;
  pickupName: string | null;
  notes: string | null;
  authorization: { firstName: string; lastName: string; relationship: string | null } | null;
  loggedBy: { firstName: string; lastName: string };
};

type Child = {
  id: string;
  firstName: string;
  lastName: string;
  class: { name: string } | null;
  pickupAuthorizations: Authorization[];
  pickupEvents: PickupEvent[];
};

const emptyForm = {
  firstName: "",
  lastName: "",
  relationship: "",
  phone: "",
  notes: "",
  expiresAt: "",
};

export default function ParentPickupSection() {
  const t = useTranslations("ParentPickup");
  const locale = useLocale() as keyof typeof dateLocales;
  const dfLocale = dateLocales[locale] ?? fr;

  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const childCtx = useOptionalSelectedChild();
  const visibleChildren = childCtx?.selectedChildId
    ? children.filter((c) => c.id === childCtx.selectedChildId)
    : children;
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorChildId, setEditorChildId] = useState<string | null>(null);
  const [editorAuthId, setEditorAuthId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Authorization | null>(null);
  const [deleting, setDeleting] = useState(false);

  const formIsDirty =
    editorOpen &&
    !submitting &&
    (form.firstName !== "" ||
      form.lastName !== "" ||
      form.relationship !== "" ||
      form.phone !== "" ||
      form.notes !== "" ||
      form.expiresAt !== "");
  useUnsavedChanges(formIsDirty);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parent/pickups");
      if (!res.ok) {
        setChildren([]);
        return;
      }
      const data = await res.json();
      setChildren(data.children ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = (childId: string) => {
    setEditorChildId(childId);
    setEditorAuthId(null);
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const openEdit = (childId: string, a: Authorization) => {
    setEditorChildId(childId);
    setEditorAuthId(a.id);
    setForm({
      firstName: a.firstName,
      lastName: a.lastName,
      relationship: a.relationship ?? "",
      phone: a.phone ?? "",
      notes: a.notes ?? "",
      expiresAt: a.expiresAt ? a.expiresAt.slice(0, 10) : "",
    });
    setEditorOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error(t("nameRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...(editorChildId ? { studentId: editorChildId } : {}),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        relationship: form.relationship.trim() || null,
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
        expiresAt: form.expiresAt || null,
      };
      const url = editorAuthId
        ? `/api/parent/pickups/authorizations/${editorAuthId}`
        : `/api/parent/pickups/authorizations`;
      const res = await fetch(url, {
        method: editorAuthId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || t("saveFailed"));
        return;
      }
      toast.success(editorAuthId ? t("updated") : t("created"));
      setEditorOpen(false);
      setForm(emptyForm);
      fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/parent/pickups/authorizations/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        toast.error(t("deleteFailed"));
        return;
      }
      toast.success(t("deleted"));
      setDeleteTarget(null);
      fetchData();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <SectionSkeleton variant="cards" rows={2} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      {visibleChildren.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fef1ea] text-[#f84a00]">
            <UserCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("noChildren")}
          </h2>
        </div>
      ) : (
        visibleChildren.map((child) => (
          <div
            key={child.id}
            className="rounded-2xl border border-black/10 bg-white p-6 space-y-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                  {(child.firstName[0] ?? "") + (child.lastName[0] ?? "")}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {child.firstName} {child.lastName}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {child.class?.name ?? t("noClass")}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="cursor-pointer"
                onClick={() => openCreate(child.id)}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {t("addAuth")}
              </Button>
            </div>

            {child.pickupAuthorizations.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                {t("noAuthYet")}
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {child.pickupAuthorizations.map((a) => {
                  const expired =
                    a.expiresAt && new Date(a.expiresAt).getTime() < Date.now();
                  return (
                    <div
                      key={a.id}
                      className={`rounded-xl border p-4 ${
                        expired
                          ? "border-red-200 bg-red-50/40"
                          : "border-black/10 bg-gray-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">
                            {a.firstName} {a.lastName}
                          </p>
                          {a.relationship && (
                            <p className="text-xs text-gray-500">
                              {a.relationship}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 cursor-pointer"
                            onClick={() => openEdit(child.id, a)}
                            aria-label={t("edit")}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 cursor-pointer text-gray-500 hover:text-red-600"
                            onClick={() => setDeleteTarget(a)}
                            aria-label={t("delete")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        {a.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3" />
                            <span>{a.phone}</span>
                          </div>
                        )}
                        {a.expiresAt && (
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-3 w-3" />
                            <span>
                              {expired
                                ? t("expiredOn", {
                                    date: format(
                                      new Date(a.expiresAt),
                                      "PP",
                                      { locale: dfLocale }
                                    ),
                                  })
                                : t("expiresOn", {
                                    date: format(
                                      new Date(a.expiresAt),
                                      "PP",
                                      { locale: dfLocale }
                                    ),
                                  })}
                            </span>
                          </div>
                        )}
                        {!a.expiresAt && (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            {t("permanent")}
                          </Badge>
                        )}
                      </div>
                      {a.notes && (
                        <p className="mt-2 text-xs italic text-gray-500">
                          {a.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {child.pickupEvents.length > 0 && (
              <div className="border-t border-black/5 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  {t("recentActivity")}
                </h3>
                <div className="space-y-2">
                  {child.pickupEvents.slice(0, 5).map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 rounded-lg bg-gray-50/60 px-3 py-2 text-sm"
                    >
                      <span
                        className={`flex h-7 w-7 flex-none items-center justify-center rounded-full ${
                          e.type === "ENTRY"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {e.type === "ENTRY" ? (
                          <LogIn className="h-3.5 w-3.5" />
                        ) : (
                          <LogOut className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-900">
                          {e.type === "ENTRY"
                            ? t("entryEvent")
                            : t("exitEvent")}
                          {e.authorization && (
                            <>
                              {" — "}
                              <span className="font-medium">
                                {e.authorization.firstName}{" "}
                                {e.authorization.lastName}
                              </span>
                            </>
                          )}
                          {!e.authorization && e.pickupName && (
                            <>
                              {" — "}
                              <span className="font-medium">
                                {e.pickupName}
                              </span>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          <Clock className="inline h-3 w-3 mr-0.5" />
                          {formatDistanceToNow(new Date(e.occurredAt), {
                            addSuffix: true,
                            locale: dfLocale,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editorAuthId ? t("editAuthTitle") : t("addAuthTitle")}
            </DialogTitle>
            <DialogDescription>{t("authDescription")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t("firstNameLabel")}</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label className="text-xs">{t("lastNameLabel")}</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">{t("relationshipLabel")}</Label>
              <Input
                value={form.relationship}
                onChange={(e) =>
                  setForm({ ...form, relationship: e.target.value })
                }
                placeholder={t("relationshipPlaceholder")}
              />
            </div>
            <div>
              <Label className="text-xs">{t("phoneLabel")}</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                type="tel"
              />
            </div>
            <div>
              <Label className="text-xs">{t("expiresAtLabel")}</Label>
              <Input
                value={form.expiresAt}
                onChange={(e) =>
                  setForm({ ...form, expiresAt: e.target.value })
                }
                type="date"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                {t("expiresAtHint")}
              </p>
            </div>
            <div>
              <Label className="text-xs">{t("notesLabel")}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setEditorOpen(false)}
                disabled={submitting}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={submitting}>
                {submitting ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>
              {deleteTarget &&
                t("deleteConfirm", {
                  name: `${deleteTarget.firstName} ${deleteTarget.lastName}`,
                })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {t("cancel")}
            </Button>
            <Button
              className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? t("deleting") : t("confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
