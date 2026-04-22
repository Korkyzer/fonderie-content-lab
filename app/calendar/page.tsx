import { AppShell } from "@/components/layout/app-shell";
import { ScreenFrame } from "@/components/screens/screen-frame";

export default function CalendarPage() {
  return (
    <AppShell>
      <ScreenFrame
        eyebrow="Calendrier éditorial"
        title="Mai 2026 et 38 publications planifiées"
        description="Planification mensuelle, événements de campagne et équilibre éditorial pour l’école."
        highlights={[
          { label: "JPO 17 mai", tone: "purple" },
          { label: "Festival Annecy", tone: "sky" },
          { label: "Puces Typo", tone: "pink" },
        ]}
      />
    </AppShell>
  );
}
