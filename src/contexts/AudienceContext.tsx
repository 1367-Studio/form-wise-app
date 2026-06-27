"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Audience = "associations" | "schools";

interface AudienceContextValue {
  audience: Audience;
  setAudience: (audience: Audience) => void;
}

const AudienceContext = createContext<AudienceContextValue | null>(null);

export function AudienceProvider({
  children,
  defaultAudience = "associations",
}: {
  children: ReactNode;
  defaultAudience?: Audience;
}) {
  const [audience, setAudience] = useState<Audience>(defaultAudience);

  return (
    <AudienceContext.Provider value={{ audience, setAudience }}>
      {children}
    </AudienceContext.Provider>
  );
}

export function useAudience() {
  const ctx = useContext(AudienceContext);
  if (!ctx) {
    throw new Error("useAudience must be used within an AudienceProvider");
  }
  return ctx;
}
