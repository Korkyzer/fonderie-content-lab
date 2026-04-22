export function Header() {
  return (
    <header className="flex flex-col gap-4 border-b border-ink/8 bg-page/90 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-sm border border-ink bg-cream px-3 py-2 shadow-hard">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em]">
            ⌘K
          </span>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">
            Recherche globale
          </p>
          <p className="text-sm text-ink/70">
            Rechercher contenu, brief, persona…
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em]">
        <span className="rounded-full border border-ink/15 bg-cream px-3 py-2">
          Notifications 3
        </span>
        <span className="rounded-full border border-ink/15 bg-purple-soft px-3 py-2">
          JPO dans 9 jours
        </span>
      </div>
    </header>
  );
}
