import { eq } from "drizzle-orm";

import { db } from "@/db/index";
import { users } from "@/db/schema";
import { isUserRole, type UserRole } from "@/lib/auth/rbac";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl: string | null;
};

export function getUserByEmail(email: string): AuthUser | null {
  const user = db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .get();

  if (!user || !isUserRole(user.role)) {
    return null;
  }

  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}
