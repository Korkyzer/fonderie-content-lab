
import { ScreenFrame } from "@/components/screens/screen-frame";

export default function GeneratorPage() {
  return (

      <ScreenFrame
        eyebrow="Générateur IA"
        title="Créer un contenu"
        description="Briefing, variantes et assets prêts pour les campagnes JPO, Parcoursup et showcase étudiants."
        highlights={[
          { label: "Lycéens 16-20", tone: "yellow" },
          { label: "Instagram Reel", tone: "sky" },
          { label: "Motion Design", tone: "purple" },
        ]}
      />

  );
}
