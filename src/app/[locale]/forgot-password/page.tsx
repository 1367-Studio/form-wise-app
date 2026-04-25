import React from "react";
import ForgotPasswordForm from "../../../components/ForgotPasswordForm";

export const metadata = {
  title: "Mot de passe oublié – Formwise",
  description:
    "Recevez un lien de réinitialisation pour votre compte Formwise.",
};

export default function page() {
  return <ForgotPasswordForm />;
}
