import { useState } from "react";
import { useSettings, useUpdateSettings } from "../lib/useRoster.js";

export default function BrandingCard() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [editing, setEditing] = useState(false);
  const [studioName, setStudioName] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [error, setError] = useState("");

  function startEdit() {
    setStudioName(settings.studio_name);
    setCurrencySymbol(settings.currency_symbol);
    setError("");
    setEditing(true);
  }

  function save() {
    if (!studioName.trim()) {
      setError("Studio name is required");
      return;
    }
    if (!currencySymbol.trim() || currencySymbol.trim().length > 3) {
      setError("Currency symbol must be 1-3 characters");
      return;
    }
    updateSettings.mutate(
      { studio_name: studioName.trim(), currency_symbol: currencySymbol.trim() },
      { onSuccess: () => setEditing(false), onError: (e) => setError(e.message) }
    );
  }

  if (isLoading) return null;

  return (
    <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-4">
      {!editing ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-plum-400 uppercase tracking-wide">Studio</p>
            <p className="font-display text-xl font-semibold">
              {settings.studio_name} <span className="text-plum-400 text-base">({settings.currency_symbol})</span>
            </p>
          </div>
          <button
            onClick={startEdit}
            className="min-h-[44px] px-4 rounded-xl bg-plum-50 text-plum-700 font-medium text-sm"
          >
            Edit
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-3">
            <label className="flex-1 text-sm">
              Studio name
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-plum-100 px-3"
              />
            </label>
            <label className="w-24 text-sm">
              Currency
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-plum-100 px-3"
              />
            </label>
          </div>
          {error && <p className="text-coral-600 text-sm mt-2">{error}</p>}
          <div className="flex gap-2 mt-3">
            <button
              onClick={save}
              disabled={updateSettings.isPending}
              className="flex-1 min-h-[44px] rounded-xl bg-plum-800 text-white font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 min-h-[44px] rounded-xl bg-plum-50 text-plum-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
