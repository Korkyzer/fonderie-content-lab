export const USER_ROLES = ["admin", "editor", "reviewer", "viewer"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type Permission =
  | "content.read"
  | "content.write"
  | "generator.use"
  | "review.comment"
  | "review.approve"
  | "admin.manage";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Éditeur",
  reviewer: "Reviewer",
  viewer: "Lecture seule",
};

const PERMISSIONS_BY_ROLE: Record<UserRole, Permission[]> = {
  admin: [
    "content.read",
    "content.write",
    "generator.use",
    "review.comment",
    "review.approve",
    "admin.manage",
  ],
  editor: ["content.read", "content.write", "generator.use", "review.comment"],
  reviewer: ["content.read", "review.comment", "review.approve"],
  viewer: ["content.read"],
};

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function getRoleLabel(role: string): string {
  return isUserRole(role) ? ROLE_LABELS[role] : "Utilisateur";
}

export function hasPermission(role: string, permission: Permission): boolean {
  return isUserRole(role) && PERMISSIONS_BY_ROLE[role].includes(permission);
}
