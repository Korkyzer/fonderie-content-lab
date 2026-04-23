"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import { Textarea } from "@/components/ui/textarea";
import {
  NEWSLETTER_SNIPPETS,
  NEWSLETTER_TEMPLATES,
  buildNewsletterHtml,
  createTemplatePayload,
  type NewsletterDraftPayload,
  type NewsletterSection,
  type StoredNewsletterDraft,
} from "@/lib/newsletter";
import { cx } from "@/lib/utils";

type NewsletterBuilderProps = {
  initialDrafts: StoredNewsletterDraft[];
};

export function NewsletterBuilder({ initialDrafts }: NewsletterBuilderProps) {
  const [templateKey, setTemplateKey] = useState<string>(NEWSLETTER_TEMPLATES[0].key);
  const [payload, setPayload] = useState<NewsletterDraftPayload>(
    () => createTemplatePayload(NEWSLETTER_TEMPLATES[0].key),
  );
  const [drafts, setDrafts] = useState(initialDrafts);
  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  const html = useMemo(() => buildNewsletterHtml(payload), [payload]);

  function patchSection(sectionId: string, patch: Partial<NewsletterSection>) {
    setPayload((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section,
      ),
    }));
  }

  function addSection() {
    setPayload((current) => ({
      ...current,
      sections: [
        ...current.sections,
        {
          id: crypto.randomUUID(),
          eyebrow: "Nouveau module",
          title: "Titre de section",
          body: "Ajoutez ici un contenu prêt à envoyer, rédigé pour une newsletter CFI.",
          highlight: "Chiffre, citation ou point-clé.",
        },
      ],
    }));
  }

  function removeSection(sectionId: string) {
    setPayload((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== sectionId),
    }));
  }

  function applyTemplate(nextKey: string) {
    setTemplateKey(nextKey);
    setPayload(createTemplatePayload(nextKey));
    setDraftId(undefined);
    setSaveState("idle");
    setSaveMessage("");
  }

  function injectSnippet(title: string, body: string) {
    setPayload((current) => ({
      ...current,
      sections: [
        {
          id: crypto.randomUUID(),
          eyebrow: "Source générateur",
          title,
          body,
          highlight: "Pré-rempli depuis les prompts éditoriaux du studio.",
        },
        ...current.sections,
      ],
    }));
  }

  async function handleSave() {
    if (saveState === "saving") return;

    try {
      setSaveState("saving");
      setSaveMessage("");
      const response = await fetch("/api/newsletter-drafts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: draftId,
          title: payload.header.title,
          templateKey,
          payload,
        }),
      });
      const json = (await response.json()) as
        | { draft: StoredNewsletterDraft }
        | { error?: string };
      if (!response.ok || !("draft" in json)) {
        throw new Error("error" in json ? json.error : "Sauvegarde impossible");
      }

      setDraftId(json.draft.id);
      setDrafts((current) => {
        const next = [json.draft, ...current.filter((draft) => draft.id !== json.draft.id)];
        return next.slice(0, 12);
      });
      setSaveState("saved");
      setSaveMessage(
        `Brouillon enregistré le ${new Date(json.draft.updatedAt).toLocaleString("fr-FR")}`,
      );
    } catch (issue) {
      setSaveState("error");
      setSaveMessage(issue instanceof Error ? issue.message : "Sauvegarde impossible");
    }
  }

  function exportHtml() {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${payload.header.title.toLowerCase().replaceAll(/\s+/g, "-")}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Newsletter builder"
        title="Assembler, prévisualiser et exporter les newsletters CFI"
        description="Pilotez le brief, relisez le rendu desktop et mobile, puis exportez un HTML prêt à envoyer."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.95fr)]">
        <Panel className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-sm border border-ink/15 bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-ink transition-colors hover:border-ink hover:bg-cream"
            >
              <Icon name="arrow" size={12} />
              Retour au générateur
            </Link>
            <Tag tone="sky">Desktop + mobile</Tag>
            <Tag tone="outline">Export HTML</Tag>
          </div>

          <div className="grid gap-6 border-t border-ink/8 pt-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="space-y-4">
              <section className="rounded-md border border-ink/10 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                    Templates CFI
                  </p>
                  <Button
                    variant="light"
                    size="sm"
                    icon={<Icon name="plus" size={12} />}
                    onClick={addSection}
                  >
                    Section
                  </Button>
                </div>
                <div className="space-y-2">
                  {NEWSLETTER_TEMPLATES.map((template) => {
                    const active = templateKey === template.key;
                    return (
                      <button
                        key={template.key}
                        type="button"
                        onClick={() => applyTemplate(template.key)}
                        className={cx(
                          "block w-full rounded-sm border px-3 py-3 text-left transition-all duration-150 ease-brand",
                          active
                            ? "border-ink bg-purple-soft/50 shadow-card"
                            : "border-ink/10 bg-cream hover:-translate-x-px hover:-translate-y-px hover:border-ink hover:bg-white",
                        )}
                      >
                        <div className="text-[13px] font-bold uppercase tracking-[0.02em]">
                          {template.name}
                        </div>
                        <div className="mt-1 text-[12px] leading-relaxed text-ink/72">
                          {template.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-md border border-ink/10 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                  Pré-remplissage depuis les contenus existants
                </p>
                <div className="mt-3 space-y-2">
                  {NEWSLETTER_SNIPPETS.map((snippet) => (
                    <button
                      key={snippet.title}
                      type="button"
                      className="block w-full rounded-sm border border-ink/10 bg-cream px-3 py-2.5 text-left transition-all duration-150 ease-brand hover:-translate-x-px hover:-translate-y-px hover:border-ink hover:bg-white"
                      onClick={() => injectSnippet(snippet.title, snippet.body)}
                    >
                      <div className="text-[13px] font-bold uppercase tracking-[0.02em]">
                        {snippet.title}
                      </div>
                      <div className="mt-1 text-[12px] leading-relaxed text-ink/72">
                        {snippet.body}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-ink/10 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                  Brouillons enregistrés
                </p>
                <div className="mt-3 space-y-2">
                  {drafts.length === 0 ? (
                    <p className="text-[12px] text-ink/60">
                      Aucun brouillon enregistré pour le moment.
                    </p>
                  ) : (
                    drafts.map((draft) => (
                      <button
                        key={draft.id}
                        type="button"
                        className="block w-full rounded-sm border border-ink/10 bg-cream px-3 py-2.5 text-left transition-all duration-150 ease-brand hover:-translate-x-px hover:-translate-y-px hover:border-ink hover:bg-white"
                        onClick={() => {
                          setDraftId(draft.id);
                          setTemplateKey(draft.templateKey);
                          setPayload(draft.payload);
                          setSaveState("idle");
                          setSaveMessage("");
                        }}
                      >
                        <div className="text-[13px] font-bold uppercase tracking-[0.02em]">
                          {draft.title}
                        </div>
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
                          {new Date(draft.updatedAt).toLocaleString("fr-FR")}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <section className="rounded-md border border-ink/10 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                  En-tête
                </p>
                <div className="mt-3 grid gap-3">
                  <Input
                    label="Eyebrow"
                    value={payload.header.eyebrow}
                    onChange={(event) =>
                      setPayload((current) => ({
                        ...current,
                        header: { ...current.header, eyebrow: event.target.value },
                      }))
                    }
                  />
                  <Input
                    label="Titre"
                    value={payload.header.title}
                    onChange={(event) =>
                      setPayload((current) => ({
                        ...current,
                        header: { ...current.header, title: event.target.value },
                      }))
                    }
                  />
                  <Textarea
                    label="Introduction"
                    value={payload.header.intro}
                    onChange={(event) =>
                      setPayload((current) => ({
                        ...current,
                        header: { ...current.header, intro: event.target.value },
                      }))
                    }
                  />
                </div>
              </section>

              <section className="rounded-md border border-ink/10 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                    Sections éditables
                  </p>
                  <Tag tone="outline">{payload.sections.length} modules</Tag>
                </div>
                <div className="space-y-3">
                  {payload.sections.map((section) => (
                    <div
                      key={section.id}
                      className="rounded-sm border border-ink/10 bg-cream p-3"
                    >
                      <div className="grid gap-3">
                        <Input
                          label="Sur-titre"
                          value={section.eyebrow}
                          onChange={(event) =>
                            patchSection(section.id, { eyebrow: event.target.value })
                          }
                        />
                        <Input
                          label="Titre"
                          value={section.title}
                          onChange={(event) =>
                            patchSection(section.id, { title: event.target.value })
                          }
                        />
                        <Textarea
                          label="Contenu"
                          value={section.body}
                          onChange={(event) =>
                            patchSection(section.id, { body: event.target.value })
                          }
                        />
                        <Input
                          label="Encadré / preuve"
                          value={section.highlight}
                          onChange={(event) =>
                            patchSection(section.id, { highlight: event.target.value })
                          }
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSection(section.id)}
                        >
                          Supprimer la section
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-ink/10 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                    Call-to-action
                  </p>
                  <div className="mt-3 grid gap-3">
                    <Input
                      label="Label"
                      value={payload.cta.label}
                      onChange={(event) =>
                        setPayload((current) => ({
                          ...current,
                          cta: { ...current.cta, label: event.target.value },
                        }))
                      }
                    />
                    <Input
                      label="URL"
                      value={payload.cta.url}
                      onChange={(event) =>
                        setPayload((current) => ({
                          ...current,
                          cta: { ...current.cta, url: event.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="rounded-md border border-ink/10 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                    Footer
                  </p>
                  <div className="mt-3 grid gap-3">
                    <Textarea
                      label="Note"
                      value={payload.footer.note}
                      onChange={(event) =>
                        setPayload((current) => ({
                          ...current,
                          footer: { ...current.footer, note: event.target.value },
                        }))
                      }
                    />
                    <Input
                      label="Signature"
                      value={payload.footer.signature}
                      onChange={(event) =>
                        setPayload((current) => ({
                          ...current,
                          footer: { ...current.footer, signature: event.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  size="md"
                  icon={<Icon name="check" size={12} />}
                  onClick={() => void handleSave()}
                  disabled={saveState === "saving"}
                >
                  {saveState === "saving" ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
                <Button
                  variant="light"
                  size="md"
                  icon={<Icon name="arrow" size={12} />}
                  onClick={exportHtml}
                >
                  Exporter HTML
                </Button>
                {saveMessage ? (
                  <Tag tone={saveState === "error" ? "red" : "green"}>{saveMessage}</Tag>
                ) : (
                  <Tag tone="outline">Prêt pour Brevo ou Mailchimp</Tag>
                )}
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                Prévisualisation responsive
              </p>
              <h2 className="mt-1 text-b2 font-display uppercase leading-tight">
                Desktop + mobile
              </h2>
            </div>
            <Tag tone="sky">HTML synchronisé</Tag>
          </div>

          <article className="rounded-md border border-ink/8 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <Tag tone="outline">Desktop</Tag>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                1280 px
              </span>
            </div>
            <PreviewNewsletter payload={payload} desktop />
          </article>

          <article className="mx-auto w-[340px] max-w-full rounded-md border border-ink/8 bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
              <Tag tone="outline">Mobile</Tag>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                390 px
              </span>
            </div>
            <PreviewNewsletter payload={payload} desktop={false} />
          </article>
        </Panel>
      </div>
    </div>
  );
}

function PreviewNewsletter({
  payload,
  desktop,
}: {
  payload: NewsletterDraftPayload;
  desktop: boolean;
}) {
  return (
    <div
      className={cx(
        "mx-auto overflow-hidden rounded-sm border border-ink/10 bg-cream shadow-card",
        desktop ? "max-w-[720px]" : "max-w-[316px]",
      )}
    >
      <div className="bg-ink px-6 py-7 text-cream">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cream/60">
          {payload.header.eyebrow}
        </p>
        <h3 className="mt-2 font-display text-[28px] uppercase leading-tight">
          {payload.header.title}
        </h3>
        <p className="mt-3 text-[13px] leading-relaxed text-cream/80">
          {payload.header.intro}
        </p>
      </div>

      <div className="space-y-3 px-5 py-5">
        {payload.sections.map((section) => (
          <section key={section.id} className="rounded-sm border border-ink/10 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
              {section.eyebrow}
            </p>
            <h4 className="mt-1 font-display text-[18px] uppercase leading-tight">
              {section.title}
            </h4>
            <p className="mt-2 text-[12px] leading-relaxed text-ink/72">{section.body}</p>
            <div className="mt-3 rounded-sm border-l-4 border-purple bg-purple-soft/40 px-3 py-2 text-[12px] font-medium text-ink">
              {section.highlight}
            </div>
          </section>
        ))}
      </div>

      <div className="space-y-3 px-5 pb-5">
        <a
          href={payload.cta.url}
          className="block rounded-sm border border-ink bg-purple px-4 py-3 text-center text-[12px] font-bold uppercase tracking-[0.06em] text-ink shadow-hard"
        >
          {payload.cta.label}
        </a>
        <div className="rounded-sm border border-ink/10 bg-white px-4 py-3 text-[12px] leading-relaxed text-ink/72">
          <p>{payload.footer.note}</p>
          <p className="mt-2 font-bold uppercase tracking-[0.02em] text-ink">
            {payload.footer.signature}
          </p>
        </div>
      </div>
    </div>
  );
}
