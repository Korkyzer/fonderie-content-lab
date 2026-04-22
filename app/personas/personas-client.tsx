"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import type { Persona } from "@/lib/data/personas";
import { cx } from "@/lib/utils";

type Props = { personas: Persona[] };

const AVATAR_BG: Record<string, string> = {
  yellow: "bg-yellow",
  sky: "bg-sky",
  pink: "bg-pink",
  caramel: "bg-caramel text-cream",
  purple: "bg-purple",
  green: "bg-green",
  orange: "bg-orange",
  lila: "bg-lila",
  turquoise: "bg-turquoise",
};

const BORDER_ACCENT: Record<string, string> = {
  yellow: "border-l-yellow",
  sky: "border-l-sky",
  pink: "border-l-pink",
  caramel: "border-l-caramel",
  purple: "border-l-purple",
  green: "border-l-green",
  orange: "border-l-orange",
  lila: "border-l-lila",
  turquoise: "border-l-turquoise",
};

const TOP_ACCENT: Record<string, string> = {
  yellow: "border-t-yellow",
  sky: "border-t-sky",
  pink: "border-t-pink",
  caramel: "border-t-caramel",
  purple: "border-t-purple",
  green: "border-t-green",
  orange: "border-t-orange",
  lila: "border-t-lila",
  turquoise: "border-t-turquoise",
};

export function PersonasExplorer({ personas }: Props) {
  const [selectedId, setSelectedId] = useState<number>(personas[0]?.id ?? 0);
  const [comparing, setComparing] = useState(false);

  const totalAudience = useMemo(() => {
    return personas
      .map((persona) => {
        const match = persona.audienceSize.match(/[\d\s ]+/);
        if (!match) return 0;
        const clean = match[0].replace(/\s| /g, "");
        return Number.parseInt(clean, 10) || 0;
      })
      .reduce((total, current) => total + current, 0);
  }, [personas]);

  const selected =
    personas.find((persona) => persona.id === selectedId) ?? personas[0];

  if (!selected) {
    return (
      <Panel>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">
          Aucune persona configurée
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Audience Personas"
        title={`${personas.length} personas · ${totalAudience.toLocaleString("fr-FR")} ciblables`}
        description="Segments prioritaires, ton de voix, plateformes, lexique recommandé et déclinaisons par audience."
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="light"
            size="sm"
            icon={<Icon name="sparkle" size={12} />}
          >
            Analyser mon audience
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Icon name="plus" size={12} />}
          >
            Nouveau persona
          </Button>
        </div>
        <label className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-ink/60">
          <input
            type="checkbox"
            checked={comparing}
            onChange={(event) => setComparing(event.target.checked)}
            className="h-3.5 w-3.5 accent-ink"
          />
          Comparer les {personas.length} personas
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {personas.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            active={persona.id === selected.id}
            onSelect={() => setSelectedId(persona.id)}
          />
        ))}
      </div>

      {comparing ? (
        <PersonaComparison personas={personas} />
      ) : (
        <>
          <PersonaDetailGrid persona={selected} />
          <PersonaBriefSample persona={selected} personas={personas} />
        </>
      )}
    </div>
  );
}

type PersonaCardProps = {
  persona: Persona;
  active: boolean;
  onSelect: () => void;
};

function PersonaCard({ persona, active, onSelect }: PersonaCardProps) {
  const avatarClass = AVATAR_BG[persona.avatarColor] ?? "bg-purple";
  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cx(
        "flex cursor-pointer flex-col gap-3 rounded-md border-2 bg-cream p-4 transition-all",
        active
          ? "border-ink shadow-[4px_4px_0_var(--ink)]"
          : "border-transparent hover:-translate-y-[2px] hover:border-ink/20 hover:shadow-card",
      )}
    >
      <div
        className={cx(
          "grid aspect-square w-full place-items-center rounded-sm text-[48px] font-bold uppercase text-ink",
          avatarClass,
        )}
      >
        {persona.avatarInitial}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/60">
          {persona.label}
        </p>
        <h3 className="text-[16px] font-bold uppercase tracking-[-0.01em]">
          {persona.name}
        </h3>
      </div>
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.05em]">
        <span>{persona.audienceSize}</span>
        <Tag tone="green">{persona.performance}</Tag>
      </div>
    </article>
  );
}

function PersonaDetailGrid({ persona }: { persona: Persona }) {
  const borderAccent = BORDER_ACCENT[persona.avatarColor] ?? "border-l-purple";

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel className="space-y-5">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink" />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em]">
              Ton de voix · {persona.name}
            </h3>
          </div>
          <Tag tone="purple">Sélectionné</Tag>
        </header>

        <blockquote
          className={cx(
            "rounded-sm border-l-4 bg-white p-4 text-[15px] leading-relaxed",
            borderAccent,
          )}
        >
          « {persona.toneOfVoice} »
        </blockquote>

        <MetaBlock title="Démographie">
          <StatRow label="Âge" value={persona.ageRange} />
          <StatRow label="Zone" value={persona.locationLabel} />
          <StatRow label="Niveau" value={persona.educationLevel} />
        </MetaBlock>

        <MetaBlock title="Plateformes privilégiées">
          <div className="flex flex-wrap gap-1.5">
            {persona.preferredPlatforms.map((platform) => (
              <Tag key={platform} tone="outline">
                {platform}
              </Tag>
            ))}
          </div>
        </MetaBlock>

        <MetaBlock title="Performance historique">
          <div className="grid grid-cols-2 gap-2">
            <MetricTile
              label="Engagement moyen"
              value={persona.engagementRate}
            />
            <MetricTile label="Meilleure heure" value={persona.bestHour} />
          </div>
        </MetaBlock>
      </Panel>

      <Panel className="space-y-5">
        <header className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em]">
            Vocabulaire
          </h3>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <VocabList title="À privilégier" tone="yes" items={persona.vocabularyYes} />
          <VocabList title="À éviter" tone="no" items={persona.vocabularyNo} />
        </div>

        <div className="border-t border-ink/8 pt-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
            Objectifs & motivations
          </p>
          <BulletList items={persona.goals} icon="arrow" />
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
            Freins & objections
          </p>
          <BulletList items={persona.painPoints} icon="warn" />
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
            Messages qui résonnent
          </p>
          <BulletList items={persona.keyMessages} icon="check" />
        </div>
      </Panel>

      <Panel className="space-y-4 xl:col-span-2">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink" />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em]">
              Contenus les plus performants
            </h3>
          </div>
          <Tag tone="sky">Top 3</Tag>
        </header>
        <ul className="flex flex-col gap-2">
          {persona.topContent.map((content) => (
            <li
              key={content}
              className="flex items-center justify-between rounded-sm bg-white px-3 py-2.5 text-[12px] font-medium"
            >
              <span className="flex items-center gap-2">
                <span
                  className={cx(
                    "h-2 w-2 rounded-sm",
                    AVATAR_BG[persona.avatarColor] ?? "bg-purple",
                  )}
                />
                {content}
              </span>
              <Icon name="arrow" size={12} />
            </li>
          ))}
        </ul>

        <div className="border-t border-ink/8 pt-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
            Recommandations éditoriales
          </p>
          <div className="flex flex-wrap gap-1.5">
            {persona.recommendations.map((recommendation) => (
              <Tag key={recommendation} tone="outline">
                {recommendation}
              </Tag>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function PersonaBriefSample({
  persona,
  personas,
}: {
  persona: Persona;
  personas: Persona[];
}) {
  return (
    <Panel className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em]">
            Déclinaison automatique · même brief, {personas.length} personas
          </h3>
        </div>
        <Tag tone="purple">Brief source</Tag>
      </header>

      <div className="rounded-sm bg-white p-4 text-[14px] font-medium leading-relaxed">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
          Brief source — {persona.name}
        </p>
        « {persona.sampleBrief} »
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {personas.map((item) => {
          const border = TOP_ACCENT[item.avatarColor] ?? "border-t-purple";
          return (
            <div
              key={item.id}
              className={cx(
                "flex flex-col gap-3 rounded-sm border-t-4 bg-white p-4",
                border,
              )}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.08em] text-ink/55">
                <Tag tone="outline">{item.preferredPlatforms[0]}</Tag>
                <span>{item.name}</span>
              </div>
              <p className="text-[13px] leading-relaxed">{item.sampleCopy}</p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function PersonaComparison({ personas }: { personas: Persona[] }) {
  return (
    <Panel className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em]">
            Comparaison personas
          </h3>
        </div>
        <Tag tone="sky">{personas.length} profils</Tag>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0 text-left text-[12px]">
          <thead>
            <tr className="bg-page text-[10px] font-bold uppercase tracking-[0.1em] text-ink/60">
              <th className="sticky left-0 bg-page p-3">Dimension</th>
              {personas.map((persona) => (
                <th key={persona.id} className="p-3 text-left">
                  {persona.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <ComparisonRow
              label="Audience"
              personas={personas}
              value={(persona) => persona.audienceSize}
            />
            <ComparisonRow
              label="Âge"
              personas={personas}
              value={(persona) => persona.ageRange}
            />
            <ComparisonRow
              label="Plateformes"
              personas={personas}
              value={(persona) => persona.preferredPlatforms.join(" · ")}
            />
            <ComparisonRow
              label="Ton"
              personas={personas}
              value={(persona) => persona.toneOfVoice}
            />
            <ComparisonRow
              label="Engagement"
              personas={personas}
              value={(persona) => persona.engagementRate}
            />
            <ComparisonRow
              label="Meilleure heure"
              personas={personas}
              value={(persona) => persona.bestHour}
            />
            <ComparisonRow
              label="Message clé"
              personas={personas}
              value={(persona) => persona.keyMessages[0] ?? "—"}
            />
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ComparisonRow({
  label,
  personas,
  value,
}: {
  label: string;
  personas: Persona[];
  value: (persona: Persona) => string;
}) {
  return (
    <tr>
      <th className="sticky left-0 border-t border-ink/8 bg-cream p-3 align-top text-[11px] font-bold uppercase tracking-[0.08em] text-ink/70">
        {label}
      </th>
      {personas.map((persona) => (
        <td
          key={persona.id}
          className="border-t border-ink/8 bg-white p-3 align-top"
        >
          {value(persona)}
        </td>
      ))}
    </tr>
  );
}

function MetaBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
        {title}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-sm bg-white px-3 py-2 text-[12px]">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/55">
        {label}
      </span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink/55">
        {label}
      </p>
      <p className="mt-1 text-[24px] font-bold tracking-[-0.01em]">{value}</p>
    </div>
  );
}

function VocabList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "yes" | "no";
}) {
  const sign = tone === "yes" ? "+" : "−";
  return (
    <div>
      <p
        className={cx(
          "mb-2 text-[10px] font-bold uppercase tracking-[0.12em]",
          tone === "yes" ? "text-green-sapin" : "text-red",
        )}
      >
        {title}
      </p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 rounded-sm bg-white px-3 py-2 text-[13px]"
          >
            <span
              className={cx(
                "font-bold",
                tone === "yes" ? "text-green" : "text-red",
              )}
            >
              {sign}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BulletList({
  items,
  icon,
}: {
  items: string[];
  icon: "arrow" | "warn" | "check";
}) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2 rounded-sm bg-white px-3 py-2 text-[12px] leading-snug"
        >
          <span className="mt-0.5 text-ink/55">
            <Icon name={icon} size={12} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
