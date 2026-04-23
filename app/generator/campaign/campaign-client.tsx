"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import type { CampaignKit, Template } from "@/lib/data/templates";
import { cx } from "@/lib/utils";

type Props = {
  templates: Template[];
  recentKits: CampaignKit[];
};

const PLATFORM_CHOICES = [
  "Instagram Reel",
  "Instagram Story",
  "Instagram Carrousel",
  "LinkedIn",
  "TikTok",
  "Email",
];

const AUDIENCE_CHOICES = [
  "Lycéens 16-20",
  "Parents",
  "Entreprises partenaires",
  "Alumni",
];

export function CampaignClient({ templates, recentKits }: Props) {
  const [objective, setObjective] = useState(
    "Promouvoir la JPO de mai 2026 et remplir les créneaux de visite",
  );
  const [formation, setFormation] = useState("");
  const [eventName, setEventName] = useState("JPO Mai");
  const [audiences, setAudiences] = useState<string[]>(["Lycéens 16-20", "Parents"]);
  const [platforms, setPlatforms] = useState<string[]>([
    "Instagram Reel",
    "LinkedIn",
    "Email",
  ]);
  const [templateSlug, setTemplateSlug] = useState<string>("");
  const [kit, setKit] = useState<CampaignKit | null>(null);
  const [source, setSource] = useState<"requesty" | "mock" | null>(null);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<number | null>(null);

  const formations = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => {
      if (t.formation) set.add(t.formation);
    });
    return ["", ...Array.from(set).sort()];
  }, [templates]);

  const events = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => {
      if (t.eventName) set.add(t.eventName);
    });
    return ["", ...Array.from(set).sort()];
  }, [templates]);

  function toggle(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
  }

  function applyTemplate(slug: string) {
    setTemplateSlug(slug);
    if (!slug) return;
    const template = templates.find((t) => t.slug === slug);
    if (!template) return;
    setObjective(template.briefSeed);
    if (template.formation) setFormation(template.formation);
    if (template.eventName) setEventName(template.eventName);
    if (template.audience) setAudiences(Array.from(new Set([template.audience, ...audiences])));
    if (!platforms.includes(template.platform)) {
      setPlatforms((prev) => [...prev, template.platform]);
    }
  }

  async function generate() {
    if (!objective.trim()) {
      setError("Décris un objectif de campagne avant de générer.");
      return;
    }
    setBusy(true);
    setError(null);
    setKit(null);
    setSource(null);
    setTokens(null);
    try {
      const res = await fetch("/api/campaign/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          objective: objective.trim(),
          formation: formation || undefined,
          eventName: eventName || undefined,
          audiences,
          platforms,
        }),
      });
      const data = (await res.json()) as {
        kit?: CampaignKit;
        source?: "requesty" | "mock";
        tokens?: number | null;
        error?: string;
      };
      if (!res.ok || !data.kit) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setKit(data.kit);
      setSource(data.source ?? "mock");
      setTokens(typeof data.tokens === "number" ? data.tokens : null);
      setActivePlatform(data.kit.items[0]?.platform ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Génération échouée");
    } finally {
      setBusy(false);
    }
  }

  function exportKit() {
    if (!kit) return;
    const blob = new Blob([JSON.stringify(kit, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${kit.slug}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const itemsByPlatform = useMemo(() => {
    if (!kit) return new Map<string, CampaignKit["items"]>();
    const map = new Map<string, CampaignKit["items"]>();
    kit.items.forEach((item) => {
      const bucket = map.get(item.platform) ?? [];
      bucket.push(item);
      map.set(item.platform, bucket);
    });
    return map;
  }, [kit]);

  const platformsInKit = useMemo(() => Array.from(itemsByPlatform.keys()), [itemsByPlatform]);
  const shownItems = activePlatform ? itemsByPlatform.get(activePlatform) ?? [] : kit?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <SectionHeading
        eyebrow="Générateur Campagne 360"
        title="Un objectif, un kit multi-plateforme"
        description="Décris une intention, sélectionne les audiences et les plateformes, le générateur produit un kit complet prêt à valider."
      />

      <Panel className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/65">
              Objectif de campagne
            </span>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={3}
              className="min-h-[100px] rounded-md border-2 border-ink bg-white p-3 text-[14px] leading-relaxed outline-none focus:border-purple"
              placeholder="Ex: Promouvoir la JPO de mai 2026 et remplir les créneaux de visite individuelle."
            />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Point de départ · template">
              <select
                value={templateSlug}
                onChange={(e) => applyTemplate(e.target.value)}
                className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
              >
                <option value="">Aucun</option>
                {templates.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Formation mise en avant">
              <select
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
                className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
              >
                {formations.map((f) => (
                  <option key={f || "none"} value={f}>
                    {f || "— Aucune"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Événement / temps fort">
              <select
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
              >
                {events.map((e) => (
                  <option key={e || "none"} value={e}>
                    {e || "— Aucun"}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Plateformes ciblées">
            <div className="flex flex-wrap gap-1.5">
              {PLATFORM_CHOICES.map((p) => (
                <Chip
                  key={p}
                  active={platforms.includes(p)}
                  onClick={() => setPlatforms((prev) => toggle(prev, p))}
                >
                  {p}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Audiences ciblées">
            <div className="flex flex-wrap gap-1.5">
              {AUDIENCE_CHOICES.map((a) => (
                <Chip
                  key={a}
                  active={audiences.includes(a)}
                  onClick={() => setAudiences((prev) => toggle(prev, a))}
                >
                  {a}
                </Chip>
              ))}
            </div>
          </Field>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-ink/55">
              {platforms.length} × {audiences.length} = {platforms.length * audiences.length} pièces
            </span>
            <Button variant="primary" onClick={generate} disabled={busy}>
              <Icon name="sparkle" size={14} /> {busy ? "Génération…" : "Générer le kit 360"}
            </Button>
          </div>
          {error ? (
            <p className="rounded-sm bg-red-100 px-3 py-2 text-[12px] text-red-800">{error}</p>
          ) : null}
        </div>
      </Panel>

      {kit ? (
        <Panel className="space-y-4">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Tag tone={source === "requesty" ? "purple" : "outline"}>
                {source === "requesty" ? "Requesty" : "Mode mock"}
              </Tag>
              <h2 className="mt-2 text-h2 font-display uppercase leading-tight">
                Kit pour : {kit.objective}
              </h2>
              <p className="mt-1 text-[12px] text-ink/60">
                {kit.items.length} pièces · généré le {new Date(kit.generatedAt).toLocaleString("fr-FR")}
                {typeof tokens === "number" ? ` · ${tokens} tokens` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportKit}
                className="inline-flex items-center gap-2 rounded-sm border border-ink bg-purple px-3 py-2 text-[12px] font-bold text-ink hover:bg-purple/90"
              >
                <Icon name="bookmark" size={14} />
                Exporter le kit
              </button>
            </div>
          </header>

          <div className="flex flex-wrap gap-1.5 border-b border-ink/10 pb-2">
            <TabButton
              active={activePlatform === null}
              onClick={() => setActivePlatform(null)}
            >
              Toutes ({kit.items.length})
            </TabButton>
            {platformsInKit.map((platform) => (
              <TabButton
                key={platform}
                active={activePlatform === platform}
                onClick={() => setActivePlatform(platform)}
              >
                {platform} ({itemsByPlatform.get(platform)?.length ?? 0})
              </TabButton>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {shownItems.map((item, idx) => (
              <article
                key={`${kit.id}-${item.platform}-${item.persona}-${idx}`}
                className="flex flex-col gap-2 rounded-md border border-ink/10 bg-cream p-4 shadow-card"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone="ink">{item.platform}</Badge>
                  <Badge tone="yellow">{item.persona}</Badge>
                  {item.format ? <Badge tone="outline">{item.format}</Badge> : null}
                  {item.duration ? <Badge tone="outline">{item.duration}</Badge> : null}
                </div>
                <h3 className="text-b2 font-display uppercase leading-tight">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-ink/85 whitespace-pre-line">
                  {item.body}
                </p>
                {item.hashtags.length > 0 ? (
                  <p className="text-[12px] font-bold text-ink/75">{item.hashtags.join(" ")}</p>
                ) : null}
                {item.cta ? (
                  <p className="rounded-sm bg-page px-3 py-2 text-[12px] text-ink/80">
                    <b>CTA :</b> {item.cta}
                  </p>
                ) : null}
                {item.notes ? (
                  <p className="text-[11px] italic text-ink/55">{item.notes}</p>
                ) : null}
              </article>
            ))}
          </div>
        </Panel>
      ) : null}

      {recentKits.length > 0 ? (
        <Panel className="space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/55">
            Kits récents
          </h3>
          <ul className="grid gap-2 md:grid-cols-2">
            {recentKits.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-sm bg-white px-3 py-2 text-[12px]"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold">{item.objective}</p>
                  <p className="text-[11px] text-ink/60">
                    {item.items.length} pièces · {item.source} ·{" "}
                    {new Date(item.generatedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <Link
                  href={`/export?kit=${encodeURIComponent(item.slug)}`}
                  className="shrink-0 text-[11px] font-bold uppercase text-purple hover:underline"
                >
                  Exporter
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/65">
        {label}
      </span>
      {children}
    </label>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-sm border px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] transition-all",
        active
          ? "border-ink bg-ink text-cream"
          : "border-ink/20 bg-white text-ink hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-sm px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors",
        active ? "bg-ink text-cream" : "text-ink/60 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
