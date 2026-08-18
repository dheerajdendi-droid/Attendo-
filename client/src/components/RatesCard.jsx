import { useState } from "react";
import {
  useSettings,
  useTiers,
  useCreateTier,
  useUpdateTier,
  useDeleteTier,
} from "../lib/useRoster.js";

export default function RatesCard() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: tiers, isLoading: tiersLoading } = useTiers();
  const createTier = useCreateTier();
  const updateTier = useUpdateTier();
  const deleteTier = useDeleteTier();

  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const currencySymbol = (settings && settings.currency_symbol) || "£";

  function startEdit() {
    setDrafts(tiers.map((t) => ({ key: t.id, id: t.id, name: t.name, rate: String(t.rate) })));
    setError("");
    setEditing(true);
  }

  function updateDraft(key, field, value) {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, [field]: value } : d)));
  }

  function addDraft() {
    setDrafts((prev) => [...prev, { key: crypto.randomUUID(), id: null, name: "", rate: "" }]);
  }

  async function removeDraft(draft) {
    if (!draft.id) {
      setDrafts((prev) => prev.filter((d) => d.key !== draft.key));
      return;
    }
    setError("");
    try {
      await deleteTier.mutateAsync(draft.id);
      setDrafts((prev) => prev.filter((d) => d.key !== draft.key));
    } catch (e) {
      setError(e.message);
    }
  }

  async function save() {
    setError("");
    for (const d of drafts) {
      if (!d.name.trim()) {
        setError("Every tier needs a name");
        return;
      }
      const rate = Number(d.rate);
      if (!Number.isFinite(rate) || rate <= 0) {
        setError("Every tier needs a valid rate");
        return;
      }
    }
    if (drafts.length === 0) {
      setError("Add at least one tier");
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        drafts.map((d, i) => {
          const payload = { name: d.name.trim(), rate: Number(d.rate), sort_order: i };
          return d.id
            ? updateTier.mutateAsync({ id: d.id, ...payload })
            : createTier.mutateAsync(payload);
        })
      );
      setEditing(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (settingsLoading || tiersLoading) return null;

  return (
    <div className="mx-4 mt-4 bg-ink-800 rounded-2xl shadow-sm p-4">
      {!editing ? (
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-6">
            {tiers.map((t) => (
              <div key={t.id}>
                <p className="text-xs text-ink-400 uppercase tracking-wide">{t.name}</p>
                <p className="font-display text-xl font-semibold text-gold-500">
                  {currencySymbol}{Number(t.rate).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={startEdit}
            className="min-h-[44px] px-4 rounded-xl bg-ink-700 text-ink-100 font-medium text-sm"
          >
            Edit rates
          </button>
        </div>
      ) : (
        <div>
          <div className="space-y-3">
            {drafts.map((d) => (
              <div key={d.key} className="flex items-end gap-2">
                <label className="flex-1 text-sm">
                  Tier name
                  <input
                    type="text"
                    value={d.name}
                    onChange={(e) => updateDraft(d.key, "name", e.target.value)}
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-ink-600 bg-ink-900 text-ink-100 px-3"
                  />
                </label>
                <label className="w-28 text-sm">
                  Rate {currencySymbol}
                  <input
                    type="number"
                    inputMode="decimal"
                    value={d.rate}
                    onChange={(e) => updateDraft(d.key, "rate", e.target.value)}
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-ink-600 bg-ink-900 text-ink-100 px-3"
                  />
                </label>
                <button
                  onClick={() => removeDraft(d)}
                  aria-label={`Remove ${d.name || "tier"}`}
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-ink-700 text-ink-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addDraft}
            className="w-full mt-3 min-h-[40px] rounded-xl border border-dashed border-ink-600 text-ink-400 text-sm font-medium"
          >
            + Add tier
          </button>

          {error && <p className="text-danger-500 text-sm mt-2">{error}</p>}

          <div className="flex gap-2 mt-3">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 min-h-[44px] rounded-xl bg-emerald-500 text-ink-950 font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 min-h-[44px] rounded-xl bg-ink-700 text-ink-100 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
