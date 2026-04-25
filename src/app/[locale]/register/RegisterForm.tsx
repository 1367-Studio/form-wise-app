"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Zap } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [civility, setCivility] = useState<"M." | "Mme" | "">("");
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolCheck, setSchoolCheck] = useState<null | {
    valid: boolean;
    name?: string;
    error?: string;
  }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      firstName,
      lastName,
      phone,
      email,
      password,
      civility,
      schoolCode: schoolCode.trim(),
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      toast.success("Inscription réussie !");
      router.push("/login");
    } catch (err) {
      console.error("Erreur réseau", err);
      toast.error("Erreur réseau. Réessayez plus tard.");
      setError("Erreur réseau. Réessayez plus tard.");
    } finally {
      setLoading(false);
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
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Se connecter
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="space-y-2">
              <Label>Civilité</Label>
              <Select
                value={civility}
                onValueChange={(value) => setCivility(value as "M." | "Mme")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Civilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M.">M.</SelectItem>
                  <SelectItem value="Mme">Mme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prénom</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Numéro de portable</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Adresse e-mail</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolCode">Code de l&apos;école</Label>
              <Input
                id="schoolCode"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
              />
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={async () => {
                    setSchoolCheck(null);
                    const res = await fetch(
                      `/api/check-code?code=${schoolCode}`
                    );
                    const result = await res.json();
                    setSchoolCheck(result);
                  }}
                >
                  Vérifier le code
                </Button>
                {schoolCheck?.valid && (
                  <p className="text-green-600 text-sm">
                    École trouvée : {schoolCheck.name}
                  </p>
                )}
                {schoolCheck?.valid === false && (
                  <p className="text-red-600 text-sm">
                    {schoolCheck.error || "Code invalide"}
                  </p>
                )}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              disabled={loading || (Boolean(schoolCode) && !schoolCheck?.valid)}
              className="w-full cursor-pointer"
            >
              {loading ? "Chargement..." : "S’inscrire"}
            </Button>
          </form>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 my-auto -m-2 flex items-center justify-center rounded-xl bg-white-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
          <Image
            alt="Formwise illustration"
            src="https://cdn.sanity.io/media-libraries/mllo1PEUbcwG/images/42483ea186e093dc722e37d638cf07d825273595-5114x2624.png"
            width={1500}
            height={1598}
            className="rounded-md shadow-2xl ring-1 ring-gray-900/10 object-contain max-h-[90vh]"
          />
        </div>
      </div>
    </div>
  );
}
