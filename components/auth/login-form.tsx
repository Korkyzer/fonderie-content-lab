"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("laure.reymond@cfi.local");
  const [password, setPassword] = useState("CFI2026!");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (!result || result.error) {
            setError("Email ou mot de passe invalide.");
            return;
          }

          router.push("/");
          router.refresh();
        });
      }}
    >
      <Input
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />
      <Input
        label="Mot de passe"
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />
      {error ? (
        <p className="rounded-sm border border-red/20 bg-red/8 px-3 py-2 text-[12px] text-red">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
