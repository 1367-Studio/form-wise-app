import type { Metadata } from "next";
import FreeTrialRegisterPage from "./FreeTrialRegisterPage";

export const metadata: Metadata = {
  title: "Form Wise app | S'inscrire",
  description: "Connexion à Form Wise",
};

export default function RegisterPage() {
  return (
    <section style={{ height: "100vh" }}>
      <FreeTrialRegisterPage />
    </section>
  );
}
