import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

const SEEDED_USERS = [
  "laure.reymond@cfi.local",
  "mathilde.dupont@cfi.local",
  "thomas.martin@cfi.local",
  "claire.bernard@cfi.local",
];

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-page px-5 py-8 text-ink md:px-8 md:py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_480px]">
        <section className="rounded-[28px] border border-ink/8 bg-ink px-7 py-8 text-cream shadow-hover md:px-10 md:py-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-purple">
            Fonderie Content Lab
          </p>
          <h1 className="mt-4 max-w-[12ch] text-[44px] font-display uppercase leading-[0.92] tracking-[0.01em] md:text-[62px]">
            Authentification locale et rôles CFI
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-6 text-cream/72">
            Connexion par email et mot de passe pour l’équipe communication.
            La structure est prête pour ajouter Google ou Microsoft ensuite.
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {SEEDED_USERS.map((email) => (
              <article
                key={email}
                className="rounded-2xl border border-cream/10 bg-cream/6 p-4 text-[12px] text-cream/78"
              >
                {email}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-ink/8 bg-cream p-6 shadow-hover md:p-8">
          <div className="rounded-[24px] border border-ink/8 bg-page p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink/50">
              Accès équipe
            </p>
            <h2 className="mt-3 text-[30px] font-display uppercase leading-none">
              Se connecter
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-ink/64">
              Mot de passe local initial: <span className="font-bold text-ink">CFI2026!</span>
            </p>
            <div className="mt-6">
              <LoginForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
