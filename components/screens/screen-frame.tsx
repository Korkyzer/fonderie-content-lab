import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";

type Tone = "purple" | "sky" | "yellow" | "green" | "pink" | "caramel" | "orange";

type ScreenFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: Array<{ label: string; tone?: Tone }>;
};

export function ScreenFrame({
  eyebrow,
  title,
  description,
  highlights,
}: ScreenFrameProps) {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <Panel className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {highlights.map((item) => (
              <Tag key={item.label} tone={item.tone}>
                {item.label}
              </Tag>
            ))}
          </div>
          <div className="rounded-lg border border-dashed border-ink/15 bg-page p-6">
            <p className="text-h2 font-display uppercase">
              Base d’écran prête pour l’itération suivante
            </p>
            <p className="mt-3 max-w-2xl text-b1 text-ink/72">
              Le shell, les routes, les tokens CFI et les tables SQLite sont en
              place. L’issue suivante peut brancher les composants métier sans
              refaire l’infrastructure.
            </p>
          </div>
        </Panel>
        <Panel className="bg-linear-to-br from-purple to-sky text-ink">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
            Fondations livrées
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>App Router avec huit écrans et navigation persistante.</li>
            <li>SQLite locale dans `db/fonderie.db` avec tables Drizzle.</li>
            <li>Seed CFI réaliste pour contenus, prompts, calendrier et personas.</li>
            <li>Palette, typo et ombres CFI disponibles via Tailwind.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
