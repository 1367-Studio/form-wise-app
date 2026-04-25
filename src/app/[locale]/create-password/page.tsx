import { Suspense } from "react";
import CreatePasswordClient from "../../../components/CreatePasswordClient";

export const metadata = {
  title: "Créer un nouveau mot de passe – Formwise",
  description:
    "Définissez un nouveau mot de passe sécurisé pour accéder à votre compte Formwise.",
};

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <CreatePasswordClient />
    </Suspense>
  );
}
