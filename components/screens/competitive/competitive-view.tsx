"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import { Placeholder, type PlaceholderTone } from "@/components/ui/placeholder";
import { cx } from "@/lib/utils";

import {
  getCompetitorVisual,
  FEED_FILTERS,
  POSTS,
  TRENDS,
  type CompetitivePost,
  type FeedFilter,
} from "./competitive-data";

type CompetitorRecord = {
  id: number;
  name: string;
  handle: string;
  primaryPlatform: string;
  monthlyPosts: number;
  deltaPercent: number;
  positioning: string;
  opportunity: string;
};

export type CompetitorInsight = {
  id: number;
  handle: string;
  summary: string;
  highlights: string[];
  opportunity: string;
  source: string;
  generatedAt: string;
};

export type CompetitiveAlert = {
  id: number;
  handle: string;
  severity: string;
  title: string;
  description: string;
  source: string;
  createdAt: string;
};

type CompetitiveViewProps = {
  competitors: CompetitorRecord[];
  insights: CompetitorInsight[];
  alerts: CompetitiveAlert[];
};

const PLATFORM_TONE: Record<string, "purple" | "orange" | "sky" | "pink"> = {
  Instagram: "purple",
  TikTok: "orange",
  LinkedIn: "sky",
  YouTube: "pink",
};

function formatDelta(delta: number) {
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${Math.abs(delta)}%`;
}

function matchesFilter(filter: FeedFilter, post: CompetitivePost) {
  if (filter === "Tous") return true;
  if (filter === "Reels") return post.type === "Reel";
  if (filter === "Carrousels") return post.type === "Carrousel";
  if (filter === "Stories") return post.type === "Story";
  if (filter === "LinkedIn") return post.platform === "LinkedIn";
  return true;
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) return iso;
  const diffMs = Date.now() - date.valueOf();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.round(diffH / 24);
  return `il y a ${diffD}j`;
}

const SEVERITY_TONE: Record<string, "red" | "orange" | "sky"> = {
  high: "red",
  medium: "orange",
  low: "sky",
};

export function CompetitiveView({ competitors, insights, alerts }: CompetitiveViewProps) {
  const [filter, setFilter] = useState<FeedFilter>("Tous");
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const visibleCompetitors = competitors.slice(0, 4);
  const competitorsByHandle = useMemo(
    () => new Map(visibleCompetitors.map((competitor) => [competitor.handle, competitor])),
    [visibleCompetitors],
  );
  const totalPosts = visibleCompetitors.reduce(
    (sum, comp) => sum + comp.monthlyPosts,
    0,
  );

  const insightsByHandle = useMemo(
    () => new Map(insights.map((insight) => [insight.handle, insight])),
    [insights],
  );

  const latestUpdatedAt = useMemo(() => {
    if (insights.length === 0) return null;
    return insights.reduce((latest, item) => {
      return new Date(item.generatedAt) > new Date(latest) ? item.generatedAt : latest;
    }, insights[0].generatedAt);
  }, [insights]);

  const filteredPosts = useMemo(
    () => POSTS.filter((post) => matchesFilter(filter, post)),
    [filter],
  );

  async function handleRefresh() {
    setRefreshError(null);
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/competitive/refresh", { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as {
        warning?: string;
        error?: string;
      };
      if (!res.ok) {
        setRefreshError(json.error ?? `Erreur ${res.status}`);
        return;
      }
      if (json.warning) setRefreshError(json.warning);
      startTransition(() => router.refresh());
    } catch (err) {
      setRefreshError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRefreshing(false);
    }
  }

  async function dismissAlert(id: number) {
    await fetch("/api/competitive/alerts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action: "dismiss" }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-ink/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">
            Veille
          </p>
          <h1 className="mt-2 text-h1 font-display uppercase">
            {visibleCompetitors.length} écoles concurrentes
            <span className="text-ink/55"> · {totalPosts} publications sur 30 jours</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {latestUpdatedAt ? (
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink/55">
              MAJ {formatRelative(latestUpdatedAt)}
            </span>
          ) : null}
          <Button variant="light" size="sm" icon={<Icon name="filter" size={14} />}>
            7 jours
          </Button>
          <Button variant="light" size="sm" icon={<Icon name="plus" size={14} />}>
            Ajouter concurrent
          </Button>
          <Button
            variant="primary"
            icon={<Icon name="sparkle" size={14} />}
            onClick={handleRefresh}
            disabled={isRefreshing || isPending}
          >
            {isRefreshing || isPending ? "Analyse…" : "Actualiser l'analyse"}
          </Button>
        </div>
      </header>

      {refreshError ? (
        <div className="rounded-md border border-orange bg-orange/10 px-4 py-2 text-[12px] text-ink">
          {refreshError}
        </div>
      ) : null}

      {alerts.length > 0 ? (
        <Card>
          <CardHeader
            title="Alertes concurrentielles"
            more={<Badge tone="red">{alerts.length} active{alerts.length > 1 ? "s" : ""}</Badge>}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {alerts.map((alert) => {
              const tone = SEVERITY_TONE[alert.severity] ?? "sky";
              const visual = getCompetitorVisual(alert.handle);
              return (
                <div
                  key={alert.id}
                  className="flex flex-col gap-2 rounded-md border border-ink/10 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cx(
                          "grid h-7 w-7 place-items-center rounded-sm border border-ink text-[10px] font-bold uppercase",
                          visual.color,
                        )}
                      >
                        {visual.short}
                      </div>
                      <Badge tone={tone}>{alert.severity}</Badge>
                      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink/55">
                        {formatRelative(alert.createdAt)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => dismissAlert(alert.id)}
                      className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink/55 hover:text-ink"
                    >
                      Masquer
                    </button>
                  </div>
                  <p className="text-[13px] font-bold leading-tight">{alert.title}</p>
                  <p className="text-[12px] leading-snug text-ink/70">{alert.description}</p>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {visibleCompetitors.map((competitor) => {
          const visual = getCompetitorVisual(competitor.handle);
          const deltaDir =
            competitor.deltaPercent > 0
              ? "text-green-sapin"
              : competitor.deltaPercent < 0
                ? "text-red"
                : "text-ink/60";
          const bars = 12;
          const filledBars = Math.min(
            bars,
            Math.round(competitor.monthlyPosts / 12),
          );
          const insight = insightsByHandle.get(competitor.handle);

          return (
            <Card key={competitor.id} className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cx(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-ink text-[13px] font-bold uppercase text-ink",
                    visual.color,
                  )}
                >
                  {visual.short}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold uppercase tracking-[0.02em]">
                    {competitor.name}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/55">
                    {competitor.monthlyPosts} posts · {" "}
                    <span className={deltaDir}>
                      {formatDelta(competitor.deltaPercent)}
                    </span>
                  </p>
                </div>
                <span className="relative grid h-3 w-3 place-items-center">
                  <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-red/50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red" />
                </span>
              </div>
              <div className="mt-4 flex items-end gap-1">
                {Array.from({ length: bars }).map((_, j) => (
                  <div
                    key={j}
                    className={cx(
                      "flex-1 rounded-[2px]",
                      j < filledBars ? visual.color : "bg-ink/8",
                    )}
                    style={{ height: `${14 + ((j * 7) % 10)}px` }}
                  />
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-tight text-ink/70">
                {insight?.summary ?? competitor.positioning}
              </p>
              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.08em] text-ink/50">
                {insight ? `MAJ ${formatRelative(insight.generatedAt)} · ${insight.source}` : "Snapshot initial"}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.65fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
              Feed des publications détectées
            </h3>
            <div className="flex flex-wrap gap-2">
              {FEED_FILTERS.map((feed) => (
                <Pill
                  key={feed}
                  active={filter === feed}
                  onClick={() => setFilter(feed)}
                >
                  {feed}
                </Pill>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const competitor = competitorsByHandle.get(post.competitorHandle);
              const visual = getCompetitorVisual(post.competitorHandle);
              const placeholderTone = post.tone as PlaceholderTone;
              const aspectClass =
                post.aspectRatio === "4/5"
                  ? "aspect-[4/5]"
                  : post.aspectRatio === "1/1"
                    ? "aspect-square"
                    : post.aspectRatio === "9/16"
                      ? "aspect-[9/16]"
                      : "aspect-video";

              return (
                <article
                  key={post.id}
                  className="flex flex-col overflow-hidden rounded-md border border-ink/8 bg-cream shadow-card transition-shadow hover:shadow-hover"
                >
                  <Placeholder
                    tone={placeholderTone}
                    label={post.type}
                    className={cx("w-full", aspectClass)}
                  />
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cx(
                            "grid h-5 w-5 place-items-center rounded-[3px] border border-ink text-[9px] font-bold uppercase",
                            visual.color,
                          )}
                        >
                          {visual.short}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink/70">
                          {post.type}
                        </span>
                      </div>
                      <Badge tone="green">{post.engagement}</Badge>
                    </div>
                    <p className="text-[13px] font-bold leading-tight">
                      {post.title}
                    </p>
                    <p className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/55">
                      <Badge tone={PLATFORM_TONE[post.platform] ?? "outline"}>
                        {post.platform}
                      </Badge>
                      <span>· {post.time}</span>
                      {competitor ? (
                        <span className="ml-auto truncate">{competitor.name}</span>
                      ) : null}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
            Tendances émergentes
          </h3>

          {TRENDS.map((trend) => (
            <Card
              key={trend.label}
              tone={trend.tone === "ink" ? "ink" : "cream"}
              className={cx(
                "flex flex-col gap-2",
                trend.tone === "sky" && "bg-sky/20 border-ink/15",
              )}
            >
              <p
                className={cx(
                  "text-[28px] font-bold leading-none tracking-[-0.02em]",
                  trend.tone === "sky" && "text-sky-deep",
                )}
              >
                {trend.delta}
              </p>
              <p className="text-[14px] font-bold leading-tight">
                {trend.label}
              </p>
              <p className="text-[12px] text-ink/70">{trend.description}</p>
              {trend.tags ? (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {trend.tags.map((tag) => (
                    <Badge key={tag.label} tone={tag.tone}>
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </Card>
          ))}

          <Card tone="ink" className="flex flex-col gap-3 border-purple bg-purple text-ink">
            <div className="flex items-center gap-2">
              <Icon name="sparkle" size={16} />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">
                Recommandation
              </span>
            </div>
            <p className="text-[15px] font-bold leading-snug">
              Tu as 3 rushs motion design inexploités. Les Reels BTS atelier
              cartonnent à +280% chez les concurrents. Générer 3 Reels maintenant ?
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="dark" size="sm">
                Générer 3 Reels
              </Button>
              <Button variant="ghost" size="sm" className="text-ink">
                Plus tard
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Opportunités détectées"
          more={<span>{visibleCompetitors.length} écoles suivies</span>}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {visibleCompetitors.map((competitor) => (
            <div
              key={competitor.id}
              className="rounded-md border border-ink/8 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cx(
                      "grid h-7 w-7 place-items-center rounded-sm border border-ink text-[11px] font-bold uppercase",
                      getCompetitorVisual(competitor.handle).color,
                    )}
                  >
                    {getCompetitorVisual(competitor.handle).short}
                  </div>
                  <span className="text-[13px] font-bold">
                    {competitor.name}
                  </span>
                </div>
                <Badge tone="outline">{competitor.handle}</Badge>
              </div>
              <p className="mt-3 text-[12px] text-ink/75">
                ✦ {competitor.opportunity}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
