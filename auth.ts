import NextAuth from "next-auth";
import type { Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { verifyPassword } from "@/lib/auth/password";
import { getUserByEmail } from "@/lib/auth/users";

const AUTH_BYPASS_ENABLED = process.env.AUTH_BYPASS === "true";

const AUTH_BYPASS_SESSION: Session = {
  user: {
    id: "auth-bypass-dev",
    name: "Arthur (Dev)",
    email: "dev@fonderie.local",
    role: "admin",
    avatarUrl: null,
  },
  expires: "2999-12-31T23:59:59.999Z",
};

const nextAuth = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = getUserByEmail(email);
        if (!user) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = typeof token.role === "string" ? token.role : "viewer";
        session.user.avatarUrl =
          typeof token.avatarUrl === "string" ? token.avatarUrl : null;
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuth;

export const auth = (async (...args: [] | Parameters<typeof nextAuth.auth>) => {
  if (AUTH_BYPASS_ENABLED && args.length === 0) {
    return AUTH_BYPASS_SESSION;
  }

  return nextAuth.auth(...(args as Parameters<typeof nextAuth.auth>));
}) as {
  (): Promise<Session | null>;
  (...args: Parameters<typeof nextAuth.auth>): ReturnType<typeof nextAuth.auth>;
};
