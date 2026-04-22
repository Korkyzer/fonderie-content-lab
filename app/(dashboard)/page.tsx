import { AppShell } from "@/components/layout/app-shell";
import { ScreenFrame } from "@/components/screens/screen-frame";

export default function DashboardPage() {
  return (
    <AppShell>
      <ScreenFrame
        eyebrow="Dashboard"
        title="Bonjour Laure, il reste 9 jours avant la JPO"
        description="Vue d’ensemble éditoriale avec KPIs, activité récente et tendances écoles créatives."
        highlights={[
          { label: "38 contenus / semaine", tone: "purple" },
          { label: "14 en production", tone: "sky" },
          { label: "Score brand 92", tone: "green" },
          { label: "Engagement 6,8%", tone: "orange" },
        ]}
      />
    </AppShell>
  );
}
