type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">
        {eyebrow}
      </p>
      <h1 className="text-h1 font-display uppercase">{title}</h1>
      <p className="max-w-3xl text-b1 text-ink/72">{description}</p>
    </div>
  );
}
