import { useEffect, useState } from "react";
import { useTiers } from "../lib/useRoster.js";

export default function StudentForm({ initial, onSave, onCancel, saving }) {
  const { data: tiers, isLoading: tiersLoading } = useTiers();
  const [name, setName] = useState(initial?.name || "");
  const [tierId, setTierId] = useState(initial?.tier_id ?? null);
  const [phone, setPhone] = useState(initial?.parent_phone || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (tierId == null && tiers && tiers.length > 0) {
      setTierId(tiers[0].id);
    }
  }, [tiers, tierId]);

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Student name is required");
      return;
    }
    if (tierId == null) {
      setError("Select a tier");
      return;
    }
    onSave({ name: name.trim(), tier_id: tierId, parent_phone: phone.trim() || null });
  }

  if (tiersLoading) return null;

  return (
    <form onSubmit={submit} className="bg-ink-800 rounded-xl border border-dashed border-ink-600 p-3 space-y-2">
      <input
        type="text"
        placeholder="Student name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full min-h-[44px] rounded-xl border border-ink-600 bg-ink-900 text-ink-100 px-3"
        autoFocus
      />
      <input
        type="tel"
        placeholder="Parent WhatsApp number (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full min-h-[44px] rounded-xl border border-ink-600 bg-ink-900 text-ink-100 px-3"
      />
      <div className="flex gap-2 flex-wrap">
        {(tiers || []).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTierId(t.id)}
            className={`flex-1 min-h-[44px] rounded-xl font-medium border ${
              tierId === t.id
                ? "bg-emerald-500 border-emerald-500 text-ink-950"
                : "bg-ink-900 border-ink-600 text-ink-100"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
      {error && <p className="text-danger-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 min-h-[44px] rounded-xl bg-emerald-500 text-ink-950 font-medium"
        >
          {initial ? "Save" : "Add student"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 min-h-[44px] rounded-xl bg-ink-900 border border-ink-600 text-ink-100 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
