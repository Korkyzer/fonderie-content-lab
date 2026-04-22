"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import { Placeholder, type PlaceholderTone } from "@/components/ui/placeholder";
import { cx } from "@/lib/utils";

import {
  COMPETITOR_VISUALS,
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

type CompetitiveViewProps = {
  competitors: CompetitorRecord[];
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

export function CompetitiveView({ competitors }: CompetitiveViewProps) {
  const [filter, setFilter] = useState<FeedFilter>("Tous");

  const visibleCompetitors = competitors.slice(0, 4);
  const totalPosts = visibleCompetitors.reduce(
    (sum, comp) => sum + comp.monthlyPosts,
    0,
  );

  const filteredPosts = useMemo(
    () => POSTS.filter((post) => matchesFilter(filter, post)),
    [filter],
  );

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
          <Button variant="light" size="sm" icon={<Icon name="filter" size={14} />}>
            7 jours
          </Button>
          <Button variant="light" size="sm" icon={<Icon name="plus" size={14} />}>
            Ajouter concurrent
          </Button>
          <Button variant="primary" icon={<Icon name="sparkle" size={14} />}>
            Synthèse IA
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {visibleCompetitors.map((competitor, index) => {
          const visual = COMPETITOR_VISUALS[index % COMPETITOR_VISUALS.length];
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
                {competitor.positioning}
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
              const competitor = visibleCompetitors[post.competitorIndex];
              const visual =
                COMPETITOR_VISUALS[
                  post.competitorIndex % COMPETITOR_VISUALS.length
                ];
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
          {visibleCompetitors.map((competitor, index) => (
            <div
              key={competitor.id}
              className="rounded-md border border-ink/8 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cx(
                      "grid h-7 w-7 place-items-center rounded-sm border border-ink text-[11px] font-bold uppercase",
                      COMPETITOR_VISUALS[
                        index % COMPETITOR_VISUALS.length
                      ].color,
                    )}
                  >
                    {COMPETITOR_VISUALS[index % COMPETITOR_VISUALS.length].short}
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
