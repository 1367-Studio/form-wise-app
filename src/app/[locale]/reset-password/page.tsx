import ResetPasswordForm from "./ResetPasswordForm";
import { Suspense } from "react";

export const metadata = {
  title: "Réinitialiser votre mot de passe – Formwise",
  description:
    "Choisissez un nouveau mot de passe pour accéder à votre compte Formwise.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
