"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function InviteParentsPage() {
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setLoading(true);
    const emailList = emails
      .split(/[\n,;]+/)
      .map((email) => email.trim())
      .filter((email) => email);

    if (emailList.length === 0) {
      toast.error("Veuillez saisir au moins une adresse email.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/invite-parent", {
        method: "POST",
        body: JSON.stringify({ emails: emailList }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Erreur lors de l'envoi des invitations");
      } else {
        toast.success("Invitations envoyées avec succès !");
        setEmails("");
      }
    } catch (err) {
      console.log("Erreur réseau", err);
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-md shadow-md mt-10">
      <h1 className="text-xl font-bold mb-4">Inviter des parents</h1>
      <Textarea
        placeholder="Entrez une ou plusieurs adresses email (séparées par des virgules, points-virgules ou sauts de ligne)"
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        rows={6}
      />
      <Button
        onClick={handleInvite}
        className="mt-4 cursor-pointer"
        disabled={loading}
      >
        {loading ? "Envoi..." : "Envoyer les invitations"}
      </Button>
    </div>
  );
}
