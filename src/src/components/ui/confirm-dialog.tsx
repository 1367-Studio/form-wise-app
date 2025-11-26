"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value?: string) => void;
  title: string;
  description?: string;

  showTextarea?: boolean;
  required?: boolean;
  isProcessing?: boolean;
  textareaPlaceholder?: string;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  showTextarea = false,
  required = false,
  textareaPlaceholder = "",
  isProcessing = false,
}: ConfirmDialogProps) {
  const [value, setValue] = React.useState("");
  const [showError, setShowError] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setValue("");
      setShowError(false);
    }
  }, [open]);

  const handleConfirm = () => {
    if (isProcessing) return;

    if (showTextarea && required && value.trim() === "") {
      setShowError(true);
      return;
    }

    setShowError(false);
    onConfirm(showTextarea ? value : undefined);
  };

  const isConfirmDisabled =
    isProcessing || (showTextarea && required && value.trim() === "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {showTextarea && (
          <>
            <Textarea
              value={value}
              onChange={(e) => {
                setValue(e.target.value);

                if (showError) {
                  setShowError(false);
                }
              }}
              placeholder={textareaPlaceholder}
              className="mt-4"
              aria-required={required}
            />

            {showError && (
              <p className="text-sm text-red-500 mt-2">
                Ce champ est obligatoire. Veuillez saisir une valeur.
              </p>
            )}
          </>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isProcessing}>
              Annuler
            </Button>
          </DialogClose>

          <Button disabled={isConfirmDisabled} onClick={handleConfirm}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
