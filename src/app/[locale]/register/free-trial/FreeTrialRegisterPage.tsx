"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Zap } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function FreeTrialRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    schoolName: "",
    phone: "",
    address: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/register/free-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/register/thank-you");
      } else {
        const data = await res.json();
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      alert("Erreur de réseau. Veuillez réessayer.");
    }
  };

  return (
    <div className="flex min-h-full flex-1">
      {/* LEFT */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link href="/" className="flex justify-center items-center gap-2">
            <Zap className="text-gray-900" />
            <h1 className="text-xl font-bold text-gray-900">Formwise</h1>
          </Link>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
            Commencez votre essai gratuit
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pas de carte requise – 20 jours offerts
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="space-y-2">
              <Label>Prénom</Label>
              <Input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Nom de l’école</Label>
              <Input
                name="schoolName"
                value={form.schoolName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-4 cursor-pointer">
              Commencer l’essai gratuit →
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline cursor-pointer"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 my-auto -m-2 flex items-center justify-center rounded-xl bg-white-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
          <Image
            alt="Formwise illustration"
            src="https://cdn.sanity.io/media-libraries/mllo1PEUbcwG/images/1a193e97e1f8408d64ecf8c4304687d2b513748f-5104x2528.png"
            width={1500}
            height={1598}
            className="rounded-md shadow-2xl ring-1 ring-gray-900/10 object-contain max-h-[90vh]"
          />
        </div>
      </div>
    </div>
  );
}
