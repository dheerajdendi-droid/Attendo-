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
    <form onSubmit={submit} className="bg-white rounded-xl border border-dashed border-plum-100 p-3 space-y-2">
      <input
        type="text"
        placeholder="Student name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full min-h-[44px] rounded-xl border border-plum-100 px-3"
        autoFocus
      />
      <input
        type="tel"
        placeholder="Parent WhatsApp number (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full min-h-[44px] rounded-xl border border-plum-100 px-3"
      />
      <div className="flex gap-2 flex-wrap">
        {(tiers || []).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTierId(t.id)}
            className={`flex-1 min-h-[44px] rounded-xl font-medium border ${
              tierId === t.id
                ? "bg-coral-500 border-coral-500 text-white"
                : "bg-white border-plum-100 text-plum-700"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
      {error && <p className="text-coral-600 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 min-h-[44px] rounded-xl bg-plum-800 text-white font-medium"
        >
          {initial ? "Save" : "Add student"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 min-h-[44px] rounded-xl bg-white border border-plum-100 text-plum-700 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
