
import { ScreenFrame } from "@/components/screens/screen-frame";

export default function BrandGuardianPage() {
  return (

      <ScreenFrame
        eyebrow="Brand Guardian"
        title="Analyse du carrousel Motion Design"
        description="Contrôle de conformité éditoriale, accessibilité et respect de la palette CFI."
        highlights={[
          { label: "Score 89/100", tone: "purple" },
          { label: "Jaune off-brand", tone: "yellow" },
          { label: "Correction +6 pts", tone: "green" },
        ]}
      />

  );
}
