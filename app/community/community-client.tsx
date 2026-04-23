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
import type {
  AlumniProfile,
  AlumniTestimonial,
  CommunityOpportunity,
  Partner,
} from "@/lib/data/community";
import { cx } from "@/lib/utils";

type Props = {
  alumni: AlumniProfile[];
  partners: Partner[];
  opportunities: CommunityOpportunity[];
  testimonials: AlumniTestimonial[];
};

const PARTNERSHIP_TONE: Record<string, "sky" | "pink" | "green" | "outline"> = {
  alternance: "sky",
  stage: "pink",
  mentorat: "green",
};

export function CommunityHub({
  alumni,
  partners,
  opportunities,
  testimonials,
}: Props) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [sector, setSector] = useState("all");
  const [skill, setSkill] = useState("all");

  const yearOptions = useMemo(
    () => [
      { value: "all", label: "Toutes les promos" },
      ...Array.from(new Set(alumni.map((item) => String(item.graduationYear))))
        .sort((a, b) => Number(b) - Number(a))
        .map((value) => ({ value, label: `Promo ${value}` })),
    ],
    [alumni],
  );

  const sectorOptions = useMemo(
    () => [
      { value: "all", label: "Tous les secteurs" },
      ...Array.from(new Set(partners.map((item) => item.sector)))
        .sort()
        .map((value) => ({ value, label: value })),
    ],
    [partners],
  );

  const skillOptions = useMemo(
    () => [
      { value: "all", label: "Toutes les compétences" },
      ...Array.from(new Set(alumni.flatMap((item) => item.skills)))
        .sort()
        .map((value) => ({ value, label: value })),
    ],
    [alumni],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredAlumni = useMemo(
    () =>
      alumni.filter((item) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          [
            item.name,
            item.currentRole,
            item.company,
            item.bio,
            item.skills.join(" "),
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesYear = year === "all" || String(item.graduationYear) === year;
        const matchesSkill = skill === "all" || item.skills.includes(skill);

        return matchesQuery && matchesYear && matchesSkill;
      }),
    [alumni, normalizedQuery, skill, year],
  );

  const filteredPartners = useMemo(
    () =>
      partners.filter((item) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          [item.name, item.sector, item.description, item.partnershipType, item.contactEmail]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesSector = sector === "all" || item.sector === sector;

        return matchesQuery && matchesSector;
      }),
    [normalizedQuery, partners, sector],
  );

  const stats = [
    { label: "Alumni", value: String(alumni.length), tone: "caramel" as const },
    { label: "Partenaires", value: String(partners.length), tone: "sky" as const },
    {
      label: "Appels actifs",
      value: String(opportunities.length),
      tone: "green" as const,
    },
    {
      label: "Témoignages",
      value: String(testimonials.length),
      tone: "purple" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Community"
        title="Réseau alumni et partenaires"
        description="Retrouver une promo, identifier une entreprise à activer et transformer un témoignage ou une opportunité en contenu."
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
                Répertoire dynamique
              </p>
              <h2 className="mt-1 text-h2 font-display uppercase">
                Alumni, partenaires, appels à projets
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/generator?title=Annonce%20opportunit%C3%A9&platform=LinkedIn&audience=Alumni&body=R%C3%A9diger%20une%20annonce%20courte%20pour%20la%20communaut%C3%A9%20alumni%20de%20la%20Fonderie."
                className={cx(
                  "inline-flex items-center justify-center gap-2 rounded-sm border px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] transition-all duration-150 ease-brand",
                  "border-ink/15 bg-cream text-ink hover:-translate-x-px hover:-translate-y-px hover:border-ink hover:bg-white",
                )}
              >
                <Icon name="sparkle" size={12} />
                Générer une annonce
              </Link>
              <Button variant="primary" size="sm" icon={<Icon name="plus" size={12} />}>
                Ajouter un contact
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-sm border border-ink/10 bg-white px-4 py-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
                  {stat.label}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[28px] font-bold leading-none">{stat.value}</span>
                  <Tag tone={stat.tone}>{stat.label}</Tag>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
            Filtres
          </p>
          <Input
            label="Recherche"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom, entreprise, compétence..."
            leading={<Icon name="search" size={14} />}
          />
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <Select
              label="Promotion"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              options={yearOptions}
            />
            <Select
              label="Secteur"
              value={sector}
              onChange={(event) => setSector(event.target.value)}
              options={sectorOptions}
            />
            <Select
              label="Compétence"
              value={skill}
              onChange={(event) => setSkill(event.target.value)}
              options={skillOptions}
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Panel className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
                Alumni
              </p>
              <h3 className="text-h2 font-display uppercase">
                {filteredAlumni.length} profils visibles
              </h3>
            </div>
            <Tag tone="outline">Recherche par promo et compétence</Tag>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {filteredAlumni.map((item) => (
              <article
                key={item.id}
                className="rounded-sm border border-ink/10 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-sm bg-purple text-[18px] font-bold text-ink">
                    {item.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-[15px] font-bold uppercase">{item.name}</h4>
                      <Tag tone="caramel">Promo {item.graduationYear}</Tag>
                    </div>
                    <p className="text-[12px] font-medium text-ink/72">
                      {item.currentRole} · {item.company}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-ink/78">{item.bio}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.skills.map((skillItem) => (
                    <Tag key={skillItem} tone="outline">
                      {skillItem}
                    </Tag>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
                Partenaires
              </p>
              <h3 className="text-h2 font-display uppercase">
                {filteredPartners.length} entreprises
              </h3>
            </div>
            <Tag tone="sky">Alternance · stage · mentorat</Tag>
          </div>
          <div className="space-y-3">
            {filteredPartners.map((item) => (
              <article
                key={item.id}
                className="rounded-sm border border-ink/10 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="text-[14px] font-bold uppercase">{item.name}</h4>
                    <p className="text-[12px] font-medium text-ink/70">{item.sector}</p>
                  </div>
                  <Tag
                    tone={
                      PARTNERSHIP_TONE[item.partnershipType.toLowerCase()] ?? "outline"
                    }
                  >
                    {item.partnershipType}
                  </Tag>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-ink/78">
                  {item.description}
                </p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink/58">
                  {item.contactEmail}
                </p>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Panel className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
                Appels à projets
              </p>
              <h3 className="text-h2 font-display uppercase">
                Opportunités à publier
              </h3>
            </div>
            <Tag tone="green">Actif</Tag>
          </div>
          <div className="space-y-3">
            {opportunities.map((item) => (
              <article
                key={item.id}
                className="rounded-sm border border-ink/10 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-[14px] font-bold uppercase">{item.title}</h4>
                  <Tag tone="outline">{item.type}</Tag>
                </div>
                <p className="mt-1 text-[12px] font-medium text-ink/72">
                  {item.company} · {item.focus}
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-ink/78">
                  {item.description}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink/58">
                    {item.graduationTarget}
                  </span>
                  <Link
                    href={`/generator?title=${encodeURIComponent(item.title)}&platform=LinkedIn&audience=Alumni&body=${encodeURIComponent(item.description)}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink"
                  >
                    Rédiger l’annonce <Icon name="arrow" size={12} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
                Témoignages alumni
              </p>
              <h3 className="text-h2 font-display uppercase">
                Prêts pour le générateur
              </h3>
            </div>
            <Tag tone="purple">Stories + LinkedIn</Tag>
          </div>
          <div className="space-y-3">
            {testimonials.map((item) => (
              <article
                key={item.id}
                className="rounded-sm border border-ink/10 bg-white p-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/55">
                  {item.alumniName} · promo {item.graduationYear}
                </p>
                <p className="mt-1 text-[13px] font-bold uppercase">{item.role}</p>
                <p className="mt-2 text-[12px] font-medium text-ink/62">{item.angle}</p>
                <blockquote className="mt-3 border-l-4 border-purple bg-page px-3 py-3 text-[13px] leading-relaxed">
                  « {item.quote} »
                </blockquote>
                <Link
                  href={`/generator?title=${encodeURIComponent(`Témoignage · ${item.alumniName}`)}&platform=LinkedIn&audience=Alumni&body=${encodeURIComponent(item.promptBody)}`}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink"
                >
                  Générer un post <Icon name="arrow" size={12} />
                </Link>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
