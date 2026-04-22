
import { ScreenFrame } from "@/components/screens/screen-frame";

export default function KanbanPage() {
  return (

      <ScreenFrame
        eyebrow="Production"
        title="Kanban contenus en cours"
        description="Pipeline multi-colonnes pour idées, briefs, production, review, validation et publication."
        highlights={[
          { label: "JPO mai 2026", tone: "purple" },
          { label: "Parcoursup", tone: "yellow" },
          { label: "IA uniquement", tone: "sky" },
        ]}
      />

  );
}
