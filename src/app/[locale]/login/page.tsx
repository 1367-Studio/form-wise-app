import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Form Wise app | Connexion",
  description: "Connexion à Form Wise",
};

export default function LoginPage() {
  return (
    <section style={{ height: "100vh" }}>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </section>
  );
}
