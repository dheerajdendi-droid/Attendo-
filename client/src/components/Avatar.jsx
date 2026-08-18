const PALETTE = ["bg-emerald-500", "bg-gold-500", "bg-emerald-600", "bg-gold-600"];

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export default function Avatar({ name, size = "md" }) {
  const sizeClass = size === "lg" ? "w-14 h-14 text-lg" : "w-11 h-11 text-sm";
  return (
    <div
      className={`${sizeClass} ${colorFor(name)} rounded-full flex items-center justify-center text-ink-950 font-semibold shrink-0`}
    >
      {initials(name)}
    </div>
  );
}
