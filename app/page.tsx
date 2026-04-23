import { ContentGenerator } from "@/components/content-generator";
import { StudioFrame } from "@/components/studio-frame";
import { resolveGeneratorPrefill } from "@/lib/generator-prefill";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const { autoRun, initialInput } = resolveGeneratorPrefill(params);

  return (
    <StudioFrame>
      <ContentGenerator initialInput={initialInput} initialAutoRun={autoRun} />
    </StudioFrame>
  );
}
