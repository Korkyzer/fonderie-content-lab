type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  return (
    <header className="panel p-6 md:p-8">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h1 className="font-heading text-4xl leading-tight md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/70">{description}</p>
    </header>
  );
}
