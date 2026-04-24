"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import {
  Placeholder,
  type PlaceholderTone,
} from "@/components/ui/placeholder";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import type { Prompt } from "@/lib/data/prompts";
import { cx } from "@/lib/utils";

type Props = { prompts: Prompt[] };

type ViewMode = "grid" | "list";

const TONE_MAP: Record<string, PlaceholderTone> = {
  purple: "purple",
  sky: "sky",
  yellow: "yellow",
  green: "green",
  orange: "orange",
  pink: "pink",
  caramel: "orange",
  turquoise: "sky",
  lila: "purple",
  ink: "ink",
};

function splitVariables(value: string): string[] {
  return value
    .split(",")
    .map((variable) => variable.trim())
    .filter(Boolean);
}

export function PromptsLibrary({ prompts }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Prompt[]>(prompts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [audience, setAudience] = useState<string>("all");
  const [platform, setPlatform] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [view, setView] = useState<ViewMode>("grid");
  const [openId, setOpenId] = useState<number | null>(
    prompts[0]?.id ?? null,
  );
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((prompt) => {
      counts.set(prompt.category, (counts.get(prompt.category) ?? 0) + 1);
    });
    return [
      { id: "all", label: "Tous", count: items.length },
      ...Array.from(counts.entries()).map(([id, count]) => ({
        id,
        label: id,
        count,
      })),
    ];
  }, [items]);

  const audiences = useMemo(() => {
    const set = new Set<string>();
    items.forEach((prompt) => set.add(prompt.audience));
    return ["all", ...Array.from(set).sort()];
  }, [items]);

  const platforms = useMemo(() => {
    const set = new Set<string>();
    items.forEach((prompt) => set.add(prompt.platform));
    return ["all", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((prompt) => {
      if (category !== "all" && prompt.category !== category) return false;
      if (audience !== "all" && prompt.audience !== audience) return false;
      if (platform !== "all" && prompt.platform !== platform) return false;
      if (favoritesOnly && !prompt.favorite) return false;
      if (!query) return true;
      const hay = `${prompt.title} ${prompt.description} ${prompt.body} ${prompt.category} ${prompt.audience} ${prompt.platform}`.toLowerCase();
      return hay.includes(query);
    });
  }, [items, search, category, audience, platform, favoritesOnly]);

  const open = useMemo(
    () => items.find((prompt) => prompt.id === openId) ?? filtered[0] ?? null,
    [items, openId, filtered],
  );

  async function toggleFavorite(id: number) {
    const previous = items;
    setItems(
      items.map((prompt) =>
        prompt.id === id ? { ...prompt, favorite: !prompt.favorite } : prompt,
      ),
    );
    try {
      const response = await fetch(`/api/prompts/${id}/favorite`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("favorite failed");
      const data = (await response.json()) as { prompt: Prompt };
      setItems((current) =>
        current.map((prompt) => (prompt.id === id ? data.prompt : prompt)),
      );
    } catch {
      setItems(previous);
    }
  }

  async function copyPrompt(prompt: Prompt) {
    try {
      await navigator.clipboard.writeText(prompt.body);
      setCopiedId(prompt.id);
      setTimeout(() => {
        setCopiedId((current) => (current === prompt.id ? null : current));
      }, 1400);
    } catch {
      // Clipboard API peut être bloquée, silent fail.
    }
  }

  function openInGenerator(prompt: Prompt) {
    const promptReference = prompt.slug?.trim() || String(prompt.id);
    const params = new URLSearchParams({ prompt: promptReference });
    router.push(`/generator?${params.toString()}`);
  }

  function openInGeneratorFromGrid(prompt: Prompt) {
    const params = new URLSearchParams({
      prompt: prompt.slug,
    });
    router.push(`/generator?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Bibliothèque de prompts"
        title={`${items.length} templates · ${categories.length - 1} catégories`}
        description="Base éditoriale réutilisable pour recrutement, événements, alumni et contenus campus."
      />

      <Panel className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-1 min-w-[240px] items-center gap-2 rounded-sm border border-ink/10 bg-white px-3 py-2.5 text-[13px] transition-colors focus-within:border-ink">
            <span className="text-ink/50">
              <Icon name="search" size={14} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Rechercher dans la bibliothèque de prompts"
              placeholder="Rechercher un prompt, un mot-clé, une audience…"
              className="flex-1 bg-transparent outline-none placeholder:text-ink/50"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Effacer la recherche"
                className="text-ink/50 hover:text-ink"
              >
                <Icon name="close" size={12} />
              </button>
            ) : null}
          </label>

          <div className="flex items-center gap-2">
            <Selector
              label="Audience"
              value={audience}
              onChange={setAudience}
              options={audiences}
            />
            <Selector
              label="Plateforme"
              value={platform}
              onChange={setPlatform}
              options={platforms}
            />
            <button
              type="button"
              onClick={() => setFavoritesOnly((value) => !value)}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-sm border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors",
                favoritesOnly
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/15 bg-white text-ink hover:border-ink",
              )}
              aria-pressed={favoritesOnly}
            >
              <Icon name="heart" size={12} />
              Favoris
            </button>
            <div className="flex overflow-hidden rounded-sm border border-ink/15">
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                aria-label="Affichage grille"
                className={cx(
                  "grid h-8 w-8 place-items-center text-ink/60 transition-colors",
                  view === "grid" ? "bg-ink text-cream" : "bg-white hover:text-ink",
                )}
              >
                <Icon name="dashboard" size={14} />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                aria-label="Affichage liste"
                className={cx(
                  "grid h-8 w-8 place-items-center text-ink/60 transition-colors",
                  view === "list" ? "bg-ink text-cream" : "bg-white hover:text-ink",
                )}
              >
                <Icon name="kanban" size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors",
                category === tab.id
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/10 bg-white text-ink/70 hover:border-ink hover:text-ink",
              )}
            >
              {tab.id === "all" ? "Tous" : tab.label}
              <span className="opacity-60">{tab.count}</span>
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/55">
              {filtered.length} résultat
              {filtered.length > 1 ? "s" : ""}
            </p>
            <Button variant="primary" size="sm" icon={<Icon name="plus" size={14} />}>
              Nouveau template
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-md border border-dashed border-ink/15 bg-page p-8 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink/50">
                Aucun prompt ne correspond
              </p>
              <p className="mt-2 text-b1 text-ink/72">
                Retirez un filtre ou essayez un autre mot-clé. Les prompts
                récents reviennent par défaut en tête de liste.
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((prompt) => (
                <PromptGridCard
                  key={prompt.id}
                  prompt={prompt}
                  active={open?.id === prompt.id}
                  copied={copiedId === prompt.id}
                  onOpen={() => setOpenId(prompt.id)}
                  onCopy={() => copyPrompt(prompt)}
                  onUse={() => openInGeneratorFromGrid(prompt)}
                  onToggleFavorite={() => toggleFavorite(prompt.id)}
                />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-ink/8 overflow-hidden rounded-md border border-ink/8">
              {filtered.map((prompt) => (
                <PromptListRow
                  key={prompt.id}
                  prompt={prompt}
                  active={open?.id === prompt.id}
                  copied={copiedId === prompt.id}
                  onOpen={() => setOpenId(prompt.id)}
                  onCopy={() => copyPrompt(prompt)}
                  onToggleFavorite={() => toggleFavorite(prompt.id)}
                />
              ))}
            </ul>
          )}
        </Panel>

        <PromptDetail
          prompt={open}
          onCopy={open ? () => copyPrompt(open) : undefined}
          copied={open ? copiedId === open.id : false}
          onUse={open ? () => openInGenerator(open) : undefined}
          onToggleFavorite={open ? () => toggleFavorite(open.id) : undefined}
        />
      </div>
    </div>
  );
}

type SelectorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

function Selector({ label, value, onChange, options }: SelectorProps) {
  return (
    <label className="flex items-center gap-1.5 rounded-sm border border-ink/15 bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink/70">
      <span className="opacity-60">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="appearance-none bg-transparent pr-2 font-bold text-ink outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "Tous" : option}
          </option>
        ))}
      </select>
    </label>
  );
}

type CardProps = {
  prompt: Prompt;
  active: boolean;
  copied: boolean;
  onOpen: () => void;
  onCopy: () => void;
  onUse?: () => void;
  onToggleFavorite: () => void;
};

function PromptGridCard({
  prompt,
  active,
  copied,
  onOpen,
  onCopy,
  onUse,
  onToggleFavorite,
}: CardProps) {
  const tone = TONE_MAP[prompt.tone] ?? "purple";
  return (
    <article
      className={cx(
        "group flex flex-col gap-3 rounded-md border bg-cream p-4 text-left transition-all",
        active
          ? "border-ink shadow-[3px_3px_0_var(--ink)]"
          : "border-ink/6 hover:-translate-y-[2px] hover:border-ink hover:shadow-card",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-pressed={active}
        aria-label={`Ouvrir le prompt ${prompt.title}`}
        className="flex flex-col gap-3 text-left"
      >
        <Placeholder
          tone={tone}
          className="aspect-[16/8] rounded-sm"
          label={prompt.platform}
        />
        <header className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold uppercase leading-tight tracking-[-0.005em]">
            {prompt.title}
          </h3>
          <Tag tone="outline">{prompt.category}</Tag>
        </header>
        <p className="min-h-[40px] text-[12px] leading-snug text-ink/70">
          {prompt.description}
        </p>
        <footer className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.08em] text-ink/55">
          <span>★ {prompt.rating.toFixed(1)} · {prompt.monthlyUsage} usages</span>
          <span>{prompt.audience}</span>
        </footer>
      </button>
      <div className="flex items-center gap-1.5 border-t border-ink/8 pt-3">
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={prompt.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={cx(
            "grid h-8 w-8 shrink-0 place-items-center rounded-sm border transition-colors",
            prompt.favorite
              ? "border-ink bg-yellow text-ink"
              : "border-ink/15 bg-white text-ink/50 hover:text-ink",
          )}
        >
          <Icon name="heart" size={12} />
        </button>
        <Button
          variant="light"
          size="sm"
          icon={<Icon name={copied ? "check" : "bookmark"} size={12} />}
          onClick={onCopy}
        >
          {copied ? "Copié" : "Copier"}
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Icon name="sparkle" size={12} />}
          onClick={onUse}
        >
          Utiliser
        </Button>
      </div>
    </article>
  );
}

function PromptListRow({
  prompt,
  active,
  copied,
  onOpen,
  onCopy,
  onToggleFavorite,
}: CardProps) {
  return (
    <li
      className={cx(
        "flex items-center gap-4 bg-white px-4 py-3 transition-colors hover:bg-cream",
        active && "bg-cream",
      )}
    >
      <button
        type="button"
        onClick={onToggleFavorite}
        aria-label={prompt.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        className={cx(
          "grid h-7 w-7 shrink-0 place-items-center rounded-sm border transition-colors",
          prompt.favorite
            ? "border-ink bg-yellow text-ink"
            : "border-ink/15 bg-white text-ink/50 hover:text-ink",
        )}
      >
        <Icon name="heart" size={12} />
      </button>
      <button
        type="button"
        onClick={onOpen}
        aria-pressed={active}
        aria-label={`Ouvrir le prompt ${prompt.title}`}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13px] font-bold uppercase tracking-tight">
            {prompt.title}
          </h3>
          <p className="truncate text-[12px] text-ink/60">{prompt.description}</p>
        </div>
        <Tag tone="outline">{prompt.category}</Tag>
        <span className="hidden text-[11px] font-bold uppercase tracking-[0.08em] text-ink/55 sm:inline">
          {prompt.audience}
        </span>
        <span className="hidden w-20 text-right text-[11px] font-bold uppercase tracking-[0.08em] text-ink/55 md:inline">
          ★ {prompt.rating.toFixed(1)}
        </span>
      </button>
      <Button
        variant="light"
        size="sm"
        icon={<Icon name={copied ? "check" : "bookmark"} size={12} />}
        onClick={onCopy}
      >
        {copied ? "Copié" : "Copier"}
      </Button>
    </li>
  );
}

type DetailProps = {
  prompt: Prompt | null;
  onCopy?: () => void;
  copied: boolean;
  onUse?: () => void;
  onToggleFavorite?: () => void;
};

function PromptDetail({
  prompt,
  onCopy,
  copied,
  onUse,
  onToggleFavorite,
}: DetailProps) {
  if (!prompt) {
    return (
      <Panel className="flex flex-col items-start justify-between gap-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">
          Aucun prompt sélectionné
        </p>
        <p className="text-b1 text-ink/72">
          Sélectionnez un template dans la liste pour voir le brief complet, les
          variables et les actions rapides.
        </p>
      </Panel>
    );
  }

  const variables = splitVariables(prompt.variables);

  return (
    <section className="flex flex-col gap-4 rounded-md border border-ink bg-ink p-5 text-cream shadow-card">
      <header className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream/55">
          Template ouvert · {prompt.platform}
        </p>
        <h2 className="text-[26px] font-bold uppercase leading-tight tracking-[-0.01em]">
          {prompt.title}
        </h2>
        <p className="text-[13px] leading-snug text-cream/70">
          {prompt.description}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.08em] text-cream/60">
        <span>★ {prompt.rating.toFixed(1)}</span>
        <span>·</span>
        <span>{prompt.monthlyUsage} usages ce mois</span>
        <span>·</span>
        <span>Créé par {prompt.author}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone="purple">{prompt.category}</Badge>
        <Badge tone="sky">{prompt.audience}</Badge>
      </div>

      {variables.length > 0 ? (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-cream/50">
            Variables
          </p>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((variable) => (
              <span
                key={variable}
                className="rounded-[3px] bg-purple/25 px-2 py-1 font-mono text-[11px] text-purple-soft"
              >
                {variable}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-cream/50">
          Prompt template
        </p>
        <pre className="whitespace-pre-wrap break-words rounded-sm bg-cream/5 p-4 font-mono text-[13px] leading-relaxed">
          {prompt.body}
        </pre>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-cream/12 pt-4">
        <Button
          variant="primary"
          size="sm"
          icon={<Icon name="sparkle" size={12} />}
          onClick={onUse}
        >
          Utiliser ce prompt
        </Button>
        <Button
          variant="light"
          size="sm"
          icon={<Icon name={copied ? "check" : "bookmark"} size={12} />}
          onClick={onCopy}
        >
          {copied ? "Copié" : "Copier le template"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<Icon name="heart" size={12} />}
          className="text-cream hover:bg-cream/10"
          onClick={onToggleFavorite}
        >
          {prompt.favorite ? "Favori" : "Ajouter aux favoris"}
        </Button>
      </div>
    </section>
  );
}
