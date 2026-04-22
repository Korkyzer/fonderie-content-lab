import { AppShell } from "@/components/layout/app-shell";
import { ScreenFrame } from "@/components/screens/screen-frame";

export default function CompetitivePage() {
  return (
    <AppShell>
      <ScreenFrame
        eyebrow="Veille concurrentielle"
        title="4 écoles concurrentes et 371 publications sur 30 jours"
        description="Bench des prises de parole, formats et opportunités détectées pour CFI."
        highlights={[
          { label: "Gobelins", tone: "purple" },
          { label: "LISAA", tone: "orange" },
          { label: "ECV", tone: "green" },
          { label: "Cifacom", tone: "pink" },
        ]}
      />
    </AppShell>
  );
}
