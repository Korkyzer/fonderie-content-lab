import { ScreenFrame } from "@/components/screens/screen-frame";
import { Panel } from "@/components/ui/panel";
import { Tag } from "@/components/ui/tag";
import { getPromptBySlug } from "@/lib/data/prompts";

type GeneratorPageProps = {
  searchParams: Promise<{
    prompt?: string;
    title?: string;
    body?: string;
    platform?: string;
    audience?: string;
  }>;
};

export default async function GeneratorPage({
  searchParams,
}: GeneratorPageProps) {
  const params = await searchParams;
  const selectedPrompt = params.prompt ? getPromptBySlug(params.prompt) : undefined;
  const promptTitle = selectedPrompt?.title ?? params.title;
  const promptBody = selectedPrompt?.body ?? params.body;
  const promptPlatform = selectedPrompt?.platform ?? params.platform;
  const promptAudience = selectedPrompt?.audience ?? params.audience;

  const highlights = [
    { label: promptAudience ?? "Lycéens 16-20", tone: "yellow" as const },
    { label: promptPlatform ?? "Instagram Reel", tone: "sky" as const },
    {
      label: selectedPrompt ? "Prompt préchargé" : "Motion Design",
      tone: "purple" as const,
    },
  ];

  return (
    <div className="space-y-5">
      <ScreenFrame
        eyebrow="Générateur IA"
        title={promptTitle ? `Créer un contenu · ${promptTitle}` : "Créer un contenu"}
        description={
          promptTitle
            ? "Le template sélectionné est repris ci-dessous pour lancer la génération sans ressaisie."
            : "Briefing, variantes et assets prêts pour les campagnes JPO, Parcoursup et showcase étudiants."
        }
        highlights={highlights}
      />
      {promptTitle && promptBody ? (
        <Panel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/55">
                Prompt sélectionné
              </p>
              <h2 className="mt-1 text-h2 font-display uppercase tracking-[0.01em]">
                {promptTitle}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {promptAudience ? <Tag tone="sky">{promptAudience}</Tag> : null}
              {promptPlatform ? <Tag tone="outline">{promptPlatform}</Tag> : null}
            </div>
          </div>
          <pre className="whitespace-pre-wrap break-words rounded-sm bg-page p-4 font-mono text-[13px] leading-relaxed text-ink/82">
            {promptBody}
          </pre>
        </Panel>
      ) : null}
    </div>
  );
}
