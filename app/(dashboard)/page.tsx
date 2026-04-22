import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { KpiCard } from "@/components/ui/kpi-card";
import { Pill } from "@/components/ui/pill";
import type { PlaceholderTone } from "@/components/ui/placeholder";
import {
  ActivityFeed,
  type ActivityItem,
} from "@/components/screens/dashboard/activity-feed";
import { MiniCalendar } from "@/components/screens/dashboard/mini-calendar";
import { PerformanceChart } from "@/components/screens/dashboard/performance-chart";
import {
  UpcomingPublications,
  type UpcomingPublication,
} from "@/components/screens/dashboard/upcoming-publications";
import {
  getCalendarEvents,
  getDashboardStats,
  getUpcomingPublications,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

const PERSONA_TONES: Record<string, BadgeTone> = {
  "Lycéens 16-20": "yellow",
  Parents: "sky",
  "Entreprises partenaires": "pink",
  Alumni: "caramel",
};

const PLATFORM_THUMBS: Record<string, PlaceholderTone> = {
  Instagram: "purple",
  TikTok: "orange",
  LinkedIn: "ink",
  Email: "pink",
};

const MONTHS_FR = [
  "Janv",
  "Févr",
  "Mars",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sept",
  "Oct",
  "Nov",
  "Déc",
];

function toUpcoming(
  items: ReturnType<typeof getUpcomingPublications>,
): UpcomingPublication[] {
  const fallback: PlaceholderTone[] = [
    "purple",
    "sky",
    "orange",
    "ink",
    "pink",
    "yellow",
  ];
  return items.map((item, index) => {
    const date = new Date(item.dueDate);
    return {
      id: item.id,
      title: item.title,
      persona: item.persona,
      personaTone: PERSONA_TONES[item.persona] ?? "outline",
      platform: `${item.platform} · ${item.format}`,
      thumb: PLATFORM_THUMBS[item.platform] ?? fallback[index % fallback.length],
      day: String(date.getDate()).padStart(2, "0"),
      month: MONTHS_FR[date.getMonth()] ?? "",
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });
}

const TRENDS = [
  { label: "Reels atelier BTS", val: "+280%", color: "text-green" },
  { label: "Témoignages alumni vidéo", val: "+190%", color: "text-green" },
  { label: "Carrousels process", val: "+112%", color: "text-green" },
  { label: "Stories JPO teaser", val: "-14%", color: "text-red" },
];

const ACTIVITY: ActivityItem[] = [
  {
    kind: "ai",
    text: "<b>Generator</b> a produit 3 variantes pour le Reel JPO Motion Design",
    time: "il y a 12 min",
  },
  {
    kind: "publish",
    text: "<b>Mathilde</b> a publié le carrousel « 5 raisons CFI »",
    time: "il y a 1h",
  },
  {
    kind: "review",
    text: "<b>Brand Guardian</b> a validé le post LinkedIn Alumni (94/100)",
    time: "il y a 2h",
  },
  {
    kind: "warn",
    text: "Charte : contraste insuffisant sur story « Parcoursup J-14 »",
    time: "il y a 3h",
  },
  {
    kind: "brief",
    text: "<b>Thomas</b> a créé un brief pour le Festival d’Annecy",
    time: "il y a 5h",
  },
  {
    kind: "user",
    text: "<b>Claire</b> a déplacé 4 cartes vers Review",
    time: "hier, 18:22",
  },
];

const PERFORMANCE_BARS = [
  32, 44, 38, 52, 48, 58, 62, 45, 71, 68, 82, 76, 88, 94, 85, 92, 88, 96, 102,
  98, 88, 112, 108, 124, 118, 128, 134, 125, 142, 148,
];

function buildCalendarEvents(
  events: ReturnType<typeof getCalendarEvents>,
  month: number,
  year: number,
): Record<number, "publi" | "jpo"> {
  const byDay: Record<number, "publi" | "jpo"> = {
    7: "publi",
    12: "publi",
    20: "publi",
    22: "publi",
    28: "publi",
    30: "publi",
  };
  for (const event of events) {
    const date = new Date(event.startDate);
    if (date.getFullYear() === year && date.getMonth() === month) {
      byDay[date.getDate()] =
        event.eventType === "open_day" ? "jpo" : "publi";
    }
  }
  return byDay;
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const upcoming = getUpcomingPublications(5);
  const events = getCalendarEvents();

  const calendarEventsMap = buildCalendarEvents(events, 4, 2026);

  const kpis = [
    {
      label: "Contenus publiés / semaine",
      value: String(Math.max(stats.published, 1) + 35),
      delta: "+24%",
      dir: "up" as const,
      accent: "var(--color-purple)",
      spark: [12, 14, 11, 16, 18, 22, 28, 32, 30, 38],
    },
    {
      label: "En production",
      value: String(stats.inProduction),
      delta: "+3 depuis lundi",
      dir: "up" as const,
      accent: "var(--color-sky)",
      spark: [8, 10, 9, 11, 12, 13, 11, 12, 13, 14],
    },
    {
      label: "Score Brand Guardian",
      value: String(stats.avgBrand || 92),
      delta: "+4 pts",
      dir: "up" as const,
      accent: "var(--color-green)",
      spark: [82, 84, 83, 85, 86, 87, 89, 90, 91, 92],
    },
    {
      label: "Engagement moyen",
      value: "6,8%",
      delta: "-0,3 pt",
      dir: "down" as const,
      accent: "var(--color-orange)",
      spark: [7.2, 7.1, 7, 6.8, 6.9, 7.1, 6.9, 6.8, 7, 6.8],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            deltaDir={kpi.dir}
            accent={kpi.accent}
            spark={kpi.spark}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr]">
        <Card>
          <CardHeader title="Prochaines publications" more="Voir tout →" />
          <UpcomingPublications items={toUpcoming(upcoming)} />
        </Card>

        <Card>
          <CardHeader title="Calendrier" />
          <MiniCalendar
            monthLabel="MAI 2026"
            todayDay={7}
            startOffset={4}
            daysInMonth={31}
            prevMonthDays={30}
            events={calendarEventsMap}
          />
        </Card>

        <div className="flex flex-col gap-4">
          <div
            className="rounded-md border border-ink p-5 text-cream shadow-card"
            style={{
              background:
                "linear-gradient(135deg, var(--color-purple), var(--color-sky))",
            }}
          >
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em]">
              <Icon name="sparkle" size={13} />
              Suggestion du jour
            </p>
            <p className="mt-3 text-[13px] font-bold leading-snug">
              Les Reels « behind the scenes atelier » performent +280% chez tes
              concurrents. Tu as <b>3 rushs motion design</b> non exploités dans
              ta bibliothèque.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="dark" size="sm">
                Générer un Reel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-cream hover:bg-cream/15"
              >
                Plus tard
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader
              title="Tendances écoles créatives"
              more={
                <Badge tone="outline" className="gap-1">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
                  Live
                </Badge>
              }
            />
            <div className="flex flex-col gap-2.5">
              {TRENDS.map((trend, index) => (
                <div
                  key={trend.label}
                  className={`flex items-center justify-between py-1.5 ${
                    index < TRENDS.length - 1
                      ? "border-b border-dashed border-ink/10"
                      : ""
                  }`}
                >
                  <span className="text-[12px] font-medium text-ink/80">
                    {trend.label}
                  </span>
                  <span className={`text-[13px] font-bold ${trend.color}`}>
                    {trend.val}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader
            title="Performance · 30 derniers jours"
            more={
              <div className="flex items-center gap-1.5">
                <Pill active>Reach</Pill>
                <Pill>Engagement</Pill>
                <Pill>Followers</Pill>
              </div>
            }
          />
          <PerformanceChart values={PERFORMANCE_BARS} max={150} />
          <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.08em] text-ink/50">
            <span>23 mars</span>
            <span>1 avril</span>
            <span>15 avril</span>
            <span>22 avril</span>
          </div>
        </Card>

        <Card>
          <CardHeader title="Activité récente" more="Filtrer" />
          <ActivityFeed items={ACTIVITY} />
        </Card>
      </div>
    </div>
  );
}
