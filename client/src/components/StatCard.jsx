export default function StatCard({ label, value }) {
  return (
    <div className="bg-ink-800 rounded-2xl shadow-sm p-3">
      <p className="text-xs text-ink-400 uppercase tracking-wide leading-tight">{label}</p>
      <p className="font-display text-xl font-semibold mt-1 text-gold-500">{value}</p>
    </div>
  );
}
