import { AppShell } from "@/components/layout/app-shell";
import { ScreenFrame } from "@/components/screens/screen-frame";

export default function PersonasPage() {
  return (
    <AppShell>
      <ScreenFrame
        eyebrow="Audience Personas"
        title="4 personas et 5 314 ciblables"
        description="Segments prioritaires, ton de voix, plateformes et lexique recommandé par audience."
        highlights={[
          { label: "Lycéens 16-20", tone: "yellow" },
          { label: "Parents", tone: "sky" },
          { label: "Entreprises partenaires", tone: "pink" },
          { label: "Alumni", tone: "caramel" },
        ]}
      />
    </AppShell>
  );
}
