"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";
import type { CreativeReference } from "@/lib/data/inspiration";
import { cx } from "@/lib/utils";

type Props = {
  references: CreativeReference[];
};

const SHOT_TONE: Record<CreativeReference["screenshotTone"], string> = {
  purple: "bg-purple/85",
  sky: "bg-sky/85",
  orange: "bg-orange/85",
  pink: "bg-pink/85",
};

export function InspirationBoard({ references }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("all");

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "Toutes les catégories" },
      ...Array.from(new Set(references.map((item) => item.category)))
        .sort()
        .map((value) => ({ value, label: value })),
    ],
    [references],
  );

  const tagOptions = useMemo(
    () => [
      { value: "all", label: "Tous les tags" },
      ...Array.from(new Set(references.flatMap((item) => item.tags)))
        .sort()
        .map((value) => ({ value, label: value })),
    ],
    [references],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return references.filter((item) => {
      const matchesQuery =
        normalized.length === 0 ||
        [item.title, item.notes, item.category, item.url, item.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesCategory = category === "all" || item.category === category;
      const matchesTag = tag === "all" || item.tags.includes(tag);

      return matchesQuery && matchesCategory && matchesTag;
    });
  }, [category, query, references, tag]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Inspiration"
        title="Repository de références créatives"
        description="Collecte fictive de hooks, campagnes et benchmarks visuels pour alimenter le générateur avec un contexte plus précis."
      />

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Panel className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
                Board éditorial
              </p>
              <h2 className="mt-1 text-h2 font-display uppercase">
                {references.length} références seedées
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="light" size="sm" icon={<Icon name="bookmark" size={12} />}>
                Ajouter une URL
              </Button>
              <Link
                href="/generator?title=Brief%20inspiration&platform=Instagram%20Reel&audience=Lyc%C3%A9ens%2016-20&body=Construire%20un%20brief%20%C3%A0%20partir%20de%20plusieurs%20r%C3%A9f%C3%A9rences%20visuelles%20et%20hooks%20social%20media."
                className={cx(
                  "inline-flex items-center justify-center gap-2 rounded-sm border px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] transition-all duration-150 ease-brand",
                  "border-ink bg-purple text-ink shadow-hard hover:-translate-x-px hover:-translate-y-px hover:bg-hover-primary hover:shadow-hard-lg",
                )}
              >
                <Icon name="sparkle" size={12} />
                Synthétiser en brief
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Score moyen"
              value={`${Math.round(references.reduce((sum, item) => sum + item.score, 0) / Math.max(references.length, 1))}/100`}
            />
            <MetricCard
              label="Catégories"
              value={String(new Set(references.map((item) => item.category)).size)}
            />
            <MetricCard
              label="Tags"
              value={String(new Set(references.flatMap((item) => item.tags)).size)}
            />
          </div>
        </Panel>

        <Panel className="space-y-3">
          <Input
            label="Recherche"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="URL, titre, note..."
            leading={<Icon name="search" size={14} />}
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Select
              label="Catégorie"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              options={categoryOptions}
            />
            <Select
              label="Tag"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              options={tagOptions}
            />
          </div>
          <p className="text-[11px] text-ink/60">
            Le bouton “S&apos;inspirer de cette référence” pré-remplit le générateur avec les notes et tags de la carte.
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {filtered.map((item) => (
          <Panel key={item.id} className="space-y-4 bg-cream">
            <div
              className={cx(
                "relative overflow-hidden rounded-sm border border-ink/10 p-4 text-ink",
                SHOT_TONE[item.screenshotTone],
              )}
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(29,29,27,0.08),transparent_55%)]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <Tag tone="ink">{item.category}</Tag>
                  <Tag tone="outline">{item.score}/100</Tag>
                </div>
                <div className="mt-8 rounded-sm border border-ink/20 bg-white/72 p-3 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
                    Screenshot placeholder
                  </p>
                  <div className="mt-3 grid gap-2">
                    <div className="h-2 rounded-full bg-ink/15" />
                    <div className="h-2 w-3/4 rounded-full bg-ink/15" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-14 rounded-sm bg-ink/10" />
                      <div className="h-14 rounded-sm bg-ink/10" />
                      <div className="h-14 rounded-sm bg-ink/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
                Référence
              </p>
              <h3 className="mt-1 text-[15px] font-bold uppercase leading-snug">
                {item.title}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-ink/76">{item.notes}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tagItem) => (
                <Tag key={tagItem} tone="outline">
                  {tagItem}
                </Tag>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-ink/8 pt-3">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.08em] text-ink/60"
              >
                Source
              </a>
              <Link
                href={item.generatorHref}
                className={cx(
                  "inline-flex items-center justify-center gap-2 rounded-sm border px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] transition-all duration-150 ease-brand",
                  "border-ink bg-ink text-cream hover:-translate-x-px hover:-translate-y-px hover:bg-hover-dark",
                )}
              >
                S&apos;inspirer
                <Icon name="arrow" size={12} />
              </Link>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-ink/10 bg-white px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
        {label}
      </p>
      <p className="mt-2 text-[28px] font-bold leading-none">{value}</p>
    </div>
  );
}
