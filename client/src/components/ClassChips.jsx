export default function ClassChips({ classes, selectedId, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-1 -mx-1 snap-x">
      {classes.map((c) => {
        const active = c.id === selectedId;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`shrink-0 snap-start min-h-[56px] px-4 rounded-2xl text-left border transition-colors ${
              active
                ? "bg-emerald-500 border-emerald-500 text-ink-950"
                : "bg-ink-800 border-ink-600 text-ink-100"
            }`}
          >
            <p className="font-semibold text-sm leading-tight">{c.name}</p>
            <p className={`text-xs leading-tight ${active ? "text-ink-950/70" : "text-ink-400"}`}>
              {c.day_of_week} · {c.time.slice(0, 5)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
