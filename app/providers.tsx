"use client";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AetherProvider } from "./context/AetherContext";
import { ReactNode } from "react";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <AetherProvider>
          <AuthProvider>{children}</AuthProvider>
        </AetherProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
