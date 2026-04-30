"use client";

import { signOut } from "next-auth/react";

import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import { Icon } from "@/components/ui/icon";
import { getRoleLabel } from "@/lib/auth/rbac";

type UserMenuProps = {
  name: string;
  role: string;
};

export function UserMenu({ name, role }: UserMenuProps) {
  return (
    <Dropdown
      trigger={
        <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-cream px-2 py-1.5">
          <Avatar name={name} tone="ink" size="md" />
          <span className="hidden text-left md:block">
            <span className="block text-[12px] font-bold text-ink">{name}</span>
            <span className="block text-[10px] uppercase tracking-[0.08em] text-ink/55">
              {getRoleLabel(role)}
            </span>
          </span>
          <Icon name="chevron-down" size={14} />
        </span>
      }
      items={[
        { id: "profile", label: "Profil" },
        { id: "preferences", label: "Préférences" },
        {
          id: "logout",
          label: "Déconnexion",
          tone: "danger",
          onSelect: () => void signOut({ callbackUrl: "/login" }),
        },
      ]}
    />
  );
}
