import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { KpiCard } from "@/components/ui/kpi-card";
import { Pill } from "@/components/ui/pill";
import { Placeholder } from "@/components/ui/placeholder";
import { Progress } from "@/components/ui/progress";
import { Sparkline } from "@/components/ui/sparkline";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        eyebrow="Dashboard"
        title="Bonjour Laure, il reste 9 jours avant la JPO"
        description="Vue d’ensemble éditoriale avec KPIs, activité récente et tendances écoles créatives."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Pill active>7 jours</Pill>
        <Pill>30 jours</Pill>
        <Pill>Trimestre</Pill>
        <span className="mx-2 h-4 w-px bg-ink/15" />
        <Button variant="primary" icon={<Icon name="plus" size={14} />}>
          Nouveau contenu
        </Button>
        <Button variant="light" icon={<Icon name="sparkle" size={14} />}>
          Générer IA
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Contenus / semaine"
          value="38"
          delta="+12%"
          deltaDir="up"
          accent="var(--color-purple)"
          spark={[22, 25, 28, 30, 29, 34, 38]}
        />
        <KpiCard
          label="En production"
          value="14"
          delta="+3"
          deltaDir="up"
          accent="var(--color-sky)"
          spark={[8, 9, 10, 12, 12, 13, 14]}
        />
        <KpiCard
          label="Score brand"
          value="92"
          delta="+4 pts"
          deltaDir="up"
          accent="var(--color-green)"
          spark={[84, 86, 85, 88, 90, 91, 92]}
        />
        <KpiCard
          label="Engagement"
          value="6,8%"
          delta="-0,4 pt"
          deltaDir="down"
          accent="var(--color-orange)"
          spark={[7.1, 7.3, 7.0, 6.9, 7.0, 6.8, 6.8]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader title="Prochaines publications" more="Voir tout" />
          <ul className="divide-y divide-dashed divide-ink/10">
            {[
              {
                title: "Reel JPO — coulisses atelier typo",
                meta: "Instagram · 9h30",
                tone: "purple" as const,
              },
              {
                title: "Carrousel projets étudiants Motion",
                meta: "LinkedIn · 14h00",
                tone: "sky" as const,
              },
              {
                title: "Stories alumni — Studio Akatre",
                meta: "Instagram · 17h45",
                tone: "orange" as const,
              },
            ].map((item) => (
              <li
                key={item.title}
                className="grid grid-cols-[56px_1fr_auto] items-center gap-3 py-3"
              >
                <Placeholder tone={item.tone} className="h-14 w-14 rounded-sm" />
                <div>
                  <p className="text-[13px] font-bold">{item.title}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/60">
                    {item.meta}
                  </p>
                </div>
                <Badge tone="outline">Planifié</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-4">
          <Card tone="ink" className="text-cream">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream/60">
              Suggestion éditoriale
            </p>
            <p className="mt-3 text-[15px] font-bold leading-snug">
              Capitalise sur la JPO dans 9 jours : une story « compte à rebours »
              stimulerait l’engagement de 18% selon l’historique.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="sky" size="sm">
                Créer maintenant
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-cream hover:bg-cream/10"
              >
                Plus tard
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Capacité IA" />
            <Progress
              value={62}
              max={100}
              tone="sky"
              label="Crédits générateur"
              showValue
            />
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/60">
                Engagement 14 jours
              </p>
              <div className="h-12 text-purple">
                <Sparkline values={[3, 4, 3, 5, 6, 5, 7, 8, 6, 9, 10, 9, 11, 12]} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
