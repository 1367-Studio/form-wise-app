import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Form Wise app | S'inscrire",
  description: "Connexion à Form Wise",
};

export default function RegisterPage() {
  return (
    <section style={{ height: "100vh" }}>
      <RegisterForm />
    </section>
  );
}
