import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { hasPermission, type Permission } from "@/lib/auth/rbac";

export async function requirePermission(permission: Permission) {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user || !role) {
    return {
      error: NextResponse.json({ error: "Authentification requise." }, { status: 401 }),
    };
  }

  if (!hasPermission(role, permission)) {
    return {
      error: NextResponse.json({ error: "Accès refusé pour ce rôle." }, { status: 403 }),
    };
  }

  return { error: null };
}
