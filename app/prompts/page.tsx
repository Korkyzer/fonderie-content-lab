import { AppShell } from "@/components/layout/app-shell";
import { ScreenFrame } from "@/components/screens/screen-frame";

export default function PromptsPage() {
  return (
    <AppShell>
      <ScreenFrame
        eyebrow="Bibliothèque de prompts"
        title="32 templates et 8 catégories"
        description="Base éditoriale réutilisable pour recrutement, événements, alumni et contenus campus."
        highlights={[
          { label: "JPO teaser reel", tone: "purple" },
          { label: "Parcoursup", tone: "yellow" },
          { label: "Newsletter alumni", tone: "caramel" },
        ]}
      />
    </AppShell>
  );
}
