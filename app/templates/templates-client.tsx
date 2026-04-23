"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import type { BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import type { Template } from "@/lib/data/templates";
import { cx } from "@/lib/utils";

type Props = { initialTemplates: Template[] };

type KindFilter = "all" | "formation" | "event" | "audience" | "general";

const KIND_LABELS: Record<KindFilter, string> = {
  all: "Tous",
  formation: "Par formation",
  event: "Par événement",
  audience: "Par audience",
  general: "Général",
};

const KIND_TONES: Record<Template["kind"], BadgeTone> = {
  formation: "purple",
  event: "sky",
  audience: "yellow",
  general: "outline",
};

type TemplateForm = {
  name: string;
  description: string;
  kind: Template["kind"];
  formation: string;
  eventName: string;
  audience: string;
  platform: string;
  tone: string;
  visualStyle: string;
  duration: string;
  cta: string;
  structure: string;
  assets: string;
  briefSeed: string;
};

const EMPTY_FORM: TemplateForm = {
  name: "",
  description: "",
  kind: "general",
  formation: "",
  eventName: "",
  audience: "",
  platform: "Instagram Reel",
  tone: "Inspirant & accessible",
  visualStyle: "Dynamique & créatif",
  duration: "30s",
  cta: "",
  structure: "",
  assets: "",
  briefSeed: "",
};

function templateToForm(template: Template): TemplateForm {
  return {
    name: template.name,
    description: template.description,
    kind: template.kind as Template["kind"],
    formation: template.formation ?? "",
    eventName: template.eventName ?? "",
    audience: template.audience ?? "",
    platform: template.platform,
    tone: template.tone,
    visualStyle: template.visualStyle,
    duration: template.duration,
    cta: template.cta,
    structure: template.structure.join("\n"),
    assets: template.assets.join("\n"),
    briefSeed: template.briefSeed,
  };
}

function formToPayload(form: TemplateForm) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    kind: form.kind,
    formation: form.formation.trim() || null,
    eventName: form.eventName.trim() || null,
    audience: form.audience.trim() || null,
    platform: form.platform.trim(),
    tone: form.tone.trim(),
    visualStyle: form.visualStyle.trim(),
    duration: form.duration.trim(),
    cta: form.cta.trim(),
    structure: form.structure
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
    assets: form.assets
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
    briefSeed: form.briefSeed.trim(),
  };
}

export function TemplatesClient({ initialTemplates }: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [formationFilter, setFormationFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [openId, setOpenId] = useState<number | null>(initialTemplates[0]?.id ?? null);
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<TemplateForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const formations = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => {
      if (t.formation) set.add(t.formation);
    });
    return ["all", ...Array.from(set).sort()];
  }, [templates]);

  const events = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => {
      if (t.eventName) set.add(t.eventName);
    });
    return ["all", ...Array.from(set).sort()];
  }, [templates]);

  const audiences = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => {
      if (t.audience) set.add(t.audience);
    });
    return ["all", ...Array.from(set).sort()];
  }, [templates]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (!showArchived && t.archived) return false;
      if (kindFilter !== "all" && t.kind !== kindFilter) return false;
      if (formationFilter !== "all" && t.formation !== formationFilter) return false;
      if (eventFilter !== "all" && t.eventName !== eventFilter) return false;
      if (audienceFilter !== "all" && t.audience !== audienceFilter) return false;
      if (!query) return true;
      const hay = `${t.name} ${t.description} ${t.platform} ${t.tone} ${t.formation ?? ""} ${t.eventName ?? ""} ${t.audience ?? ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [templates, search, kindFilter, formationFilter, eventFilter, audienceFilter, showArchived]);

  const open = useMemo(
    () => templates.find((t) => t.id === openId) ?? filtered[0] ?? null,
    [templates, openId, filtered],
  );

  function startCreate() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setFormError(null);
    setCreating(true);
  }

  function startEdit(template: Template) {
    setForm(templateToForm(template));
    setEditing(template);
    setFormError(null);
    setCreating(true);
  }

  async function submitForm() {
    setBusy(true);
    setFormError(null);
    const payload = formToPayload(form);
    if (!payload.name) {
      setFormError("Le nom est requis");
      setBusy(false);
      return;
    }
    if (payload.structure.length === 0) {
      setFormError("Décris au moins une étape de structure");
      setBusy(false);
      return;
    }

    const url = editing ? `/api/templates/${editing.id}` : "/api/templates";
    const method = editing ? "PATCH" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { template?: Template; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      if (data.template) {
        setTemplates((prev) =>
          editing
            ? prev.map((t) => (t.id === data.template!.id ? data.template! : t))
            : [...prev, data.template!],
        );
        setOpenId(data.template.id);
      }
      setCreating(false);
      setEditing(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  }

  async function duplicate(template: Template) {
    setBusy(true);
    try {
      const res = await fetch(`/api/templates/${template.id}/duplicate`, {
        method: "POST",
      });
      const data = (await res.json()) as { template?: Template };
      if (data.template) {
        setTemplates((prev) => [...prev, data.template!]);
        setOpenId(data.template.id);
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggleArchive(template: Template) {
    setBusy(true);
    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ archived: !template.archived }),
      });
      const data = (await res.json()) as { template?: Template };
      if (data.template) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === data.template!.id ? data.template! : t)),
        );
      }
    } finally {
      setBusy(false);
    }
  }

  function useInGenerator(template: Template) {
    const params = new URLSearchParams({
      template: template.slug,
      title: template.name,
      body: template.briefSeed,
      platform: template.platform,
      audience: template.audience ?? "",
    });
    router.push(`/generator?${params.toString()}`);
  }

  const counts = useMemo(() => {
    const total = templates.filter((t) => !t.archived).length;
    const archived = templates.filter((t) => t.archived).length;
    const byKind = templates.reduce<Record<string, number>>((acc, t) => {
      if (t.archived) return acc;
      acc[t.kind] = (acc[t.kind] ?? 0) + 1;
      return acc;
    }, {});
    return { total, archived, byKind };
  }, [templates]);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeading
        eyebrow="Templates visuels"
        title="Kits de campagne réutilisables"
        description="Modèles prêts à l'emploi pour chaque formation, événement et audience CFI. Sélectionne un template pour pré-remplir le générateur."
      />

      <Panel className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="purple">{counts.total} actifs</Tag>
          <Tag tone="outline">{counts.byKind.formation ?? 0} formation</Tag>
          <Tag tone="sky">{counts.byKind.event ?? 0} événement</Tag>
          <Tag tone="yellow">{counts.byKind.audience ?? 0} audience</Tag>
          {counts.archived > 0 ? (
            <Tag tone="outline">{counts.archived} archivés</Tag>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="light" onClick={() => router.push("/generator/campaign")}>
            <Icon name="sparkle" size={14} /> Campagne 360
          </Button>
          <Button variant="primary" onClick={startCreate}>
            <Icon name="plus" size={14} /> Créer un template
          </Button>
        </div>
      </Panel>

      <Panel className="flex flex-wrap items-end gap-3">
        <FilterField label="Recherche">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, formation, événement..."
            className="w-56 rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px] outline-none focus:border-purple"
          />
        </FilterField>
        <FilterField label="Type">
          <FilterSelect
            value={kindFilter}
            onChange={(v) => setKindFilter(v as KindFilter)}
            options={(Object.keys(KIND_LABELS) as KindFilter[]).map((id) => ({
              id,
              label: KIND_LABELS[id],
            }))}
          />
        </FilterField>
        <FilterField label="Formation">
          <FilterSelect
            value={formationFilter}
            onChange={setFormationFilter}
            options={formations.map((f) => ({ id: f, label: f === "all" ? "Toutes" : f }))}
          />
        </FilterField>
        <FilterField label="Événement">
          <FilterSelect
            value={eventFilter}
            onChange={setEventFilter}
            options={events.map((e) => ({ id: e, label: e === "all" ? "Tous" : e }))}
          />
        </FilterField>
        <FilterField label="Audience">
          <FilterSelect
            value={audienceFilter}
            onChange={setAudienceFilter}
            options={audiences.map((a) => ({ id: a, label: a === "all" ? "Toutes" : a }))}
          />
        </FilterField>
        <label className="ml-auto inline-flex items-center gap-2 text-[12px] font-bold">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-4 w-4"
          />
          Voir les archivés
        </label>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((template) => {
            const active = open?.id === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setOpenId(template.id)}
                className={cx(
                  "flex flex-col gap-2 rounded-md border bg-cream p-4 text-left shadow-card transition-all",
                  active
                    ? "border-ink shadow-hard"
                    : "border-ink/10 hover:border-ink/40 hover:-translate-y-px",
                  template.archived ? "opacity-60" : "",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <Tag tone={KIND_TONES[template.kind as Template["kind"]] ?? "outline"}>
                    {KIND_LABELS[template.kind as KindFilter] ?? template.kind}
                  </Tag>
                  {template.archived ? <Badge tone="outline">Archivé</Badge> : null}
                </div>
                <h3 className="text-b2 font-display uppercase leading-tight">
                  {template.name}
                </h3>
                <p className="text-[12px] leading-snug text-ink/70 line-clamp-3">
                  {template.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 text-[10px]">
                  <Badge tone="ink">{template.platform}</Badge>
                  <Badge tone="outline">{template.duration}</Badge>
                  {template.formation ? (
                    <Badge tone="purple">{template.formation}</Badge>
                  ) : null}
                  {template.eventName ? (
                    <Badge tone="sky">{template.eventName}</Badge>
                  ) : null}
                  {template.audience ? (
                    <Badge tone="yellow">{template.audience}</Badge>
                  ) : null}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 ? (
            <Panel className="col-span-full text-center text-[13px] text-ink/60">
              Aucun template ne correspond à ces filtres.
            </Panel>
          ) : null}
        </div>

        <Panel className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {open ? (
            <>
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Tag tone={KIND_TONES[open.kind as Template["kind"]] ?? "outline"}>
                    {KIND_LABELS[open.kind as KindFilter] ?? open.kind}
                  </Tag>
                  <h2 className="mt-2 text-h2 font-display uppercase leading-tight">
                    {open.name}
                  </h2>
                  <p className="mt-2 text-[13px] text-ink/70">{open.description}</p>
                </div>
              </header>

              <dl className="grid grid-cols-2 gap-3 text-[12px]">
                <Detail label="Plateforme">{open.platform}</Detail>
                <Detail label="Durée / format">{open.duration}</Detail>
                <Detail label="Ton">{open.tone}</Detail>
                <Detail label="Style visuel">{open.visualStyle}</Detail>
                {open.formation ? (
                  <Detail label="Formation">{open.formation}</Detail>
                ) : null}
                {open.eventName ? (
                  <Detail label="Événement">{open.eventName}</Detail>
                ) : null}
                {open.audience ? (
                  <Detail label="Audience">{open.audience}</Detail>
                ) : null}
                <Detail label="CTA">{open.cta}</Detail>
              </dl>

              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/55">
                  Structure suggérée
                </h3>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[13px] text-ink/85">
                  {open.structure.map((step, idx) => (
                    <li key={`${open.id}-step-${idx}`}>{step}</li>
                  ))}
                </ol>
              </section>

              {open.assets.length > 0 ? (
                <section>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/55">
                    Assets suggérés
                  </h3>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {open.assets.map((asset) => (
                      <Badge key={`${open.id}-asset-${asset}`} tone="outline">
                        {asset}
                      </Badge>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/55">
                  Brief pré-rempli
                </h3>
                <p className="mt-2 rounded-sm bg-page p-3 text-[12px] leading-relaxed text-ink/85">
                  {open.briefSeed}
                </p>
              </section>

              <footer className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={() => useInGenerator(open)}
                  disabled={busy}
                >
                  <Icon name="sparkle" size={14} /> Utiliser ce template
                </Button>
                <Button variant="light" onClick={() => startEdit(open)} disabled={busy}>
                  <Icon name="more" size={14} /> Modifier
                </Button>
                <Button variant="light" onClick={() => duplicate(open)} disabled={busy}>
                  <Icon name="plus" size={14} /> Dupliquer
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => toggleArchive(open)}
                  disabled={busy}
                >
                  <Icon name={open.archived ? "check" : "close"} size={14} />
                  {open.archived ? "Réactiver" : "Archiver"}
                </Button>
              </footer>
            </>
          ) : (
            <p className="text-[13px] text-ink/55">
              Sélectionne un template pour voir le détail.
            </p>
          )}
        </Panel>
      </div>

      <Modal
        open={creating}
        onClose={() => {
          if (busy) return;
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? `Modifier ${editing.name}` : "Nouveau template"}
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              disabled={busy}
            >
              Annuler
            </Button>
            <Button variant="primary" onClick={submitForm} disabled={busy}>
              {editing ? "Enregistrer" : "Créer"}
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <FormRow label="Nom" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
            />
          </FormRow>
          <FormRow label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
            />
          </FormRow>
          <div className="grid gap-3 md:grid-cols-3">
            <FormRow label="Type">
              <select
                value={form.kind}
                onChange={(e) =>
                  setForm({ ...form, kind: e.target.value as Template["kind"] })
                }
                className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
              >
                <option value="general">Général</option>
                <option value="formation">Par formation</option>
                <option value="event">Par événement</option>
                <option value="audience">Par audience</option>
              </select>
            </FormRow>
            <FormRow label="Plateforme">
              <input
                type="text"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
              />
            </FormRow>
            <FormRow label="Durée / format">
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
              />
            </FormRow>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <FormRow label="Formation">
              <input
                type="text"
                value={form.formation}
                onChange={(e) => setForm({ ...form, formation: e.target.value })}
                placeholder="Motion Design, ..."
                className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
              />
            </FormRow>
            <FormRow label="Événement">
              <input
                type="text"
                value={form.eventName}
                onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                placeholder="JPO Mai, Parcoursup..."
                className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
              />
            </FormRow>
            <FormRow label="Audience">
              <input
                type="text"
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
                placeholder="Lycéens 16-20..."
                className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
              />
            </FormRow>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FormRow label="Ton éditorial">
              <input
                type="text"
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
                className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
              />
            </FormRow>
            <FormRow label="Style visuel">
              <input
                type="text"
                value={form.visualStyle}
                onChange={(e) => setForm({ ...form, visualStyle: e.target.value })}
                className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
              />
            </FormRow>
          </div>
          <FormRow label="CTA">
            <input
              type="text"
              value={form.cta}
              onChange={(e) => setForm({ ...form, cta: e.target.value })}
              className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
            />
          </FormRow>
          <FormRow label="Structure (une étape par ligne)" required>
            <textarea
              value={form.structure}
              onChange={(e) => setForm({ ...form, structure: e.target.value })}
              rows={5}
              className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 font-mono text-[12px]"
            />
          </FormRow>
          <FormRow label="Assets suggérés (un par ligne)">
            <textarea
              value={form.assets}
              onChange={(e) => setForm({ ...form, assets: e.target.value })}
              rows={3}
              className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 font-mono text-[12px]"
            />
          </FormRow>
          <FormRow label="Brief pré-rempli">
            <textarea
              value={form.briefSeed}
              onChange={(e) => setForm({ ...form, briefSeed: e.target.value })}
              rows={3}
              className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px]"
            />
          </FormRow>
          {formError ? (
            <p className="rounded-sm bg-red-100 px-3 py-2 text-[12px] text-red-800">
              {formError}
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
        {label}
      </span>
      {children}
    </label>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (next: string) => void;
  options: Array<{ id: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px] outline-none focus:border-purple"
    >
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
        {label}
      </dt>
      <dd className="mt-1 text-[12px] text-ink/85">{children}</dd>
    </div>
  );
}

function FormRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/65">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
