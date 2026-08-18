import { useState } from "react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ClassForm({ initial, onSave, onCancel, saving }) {
  const [name, setName] = useState(initial?.name || "");
  const [day, setDay] = useState(initial?.day_of_week || "Saturday");
  const [time, setTime] = useState(initial?.time ? initial.time.slice(0, 5) : "10:00");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Class name is required");
      return;
    }
    onSave({ name: name.trim(), day_of_week: day, time });
  }

  return (
    <form onSubmit={submit} className="bg-ink-700/60 rounded-2xl p-4 space-y-3">
      <input
        type="text"
        placeholder="Class name (e.g. Juniors Level 1 Kuchipudi)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full min-h-[44px] rounded-xl border border-ink-600 px-3 bg-ink-900 text-ink-100"
        autoFocus
      />
      <div className="flex gap-3">
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="flex-1 min-h-[44px] rounded-xl border border-ink-600 px-3 bg-ink-900 text-ink-100"
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="flex-1 min-h-[44px] rounded-xl border border-ink-600 px-3 bg-ink-900 text-ink-100"
        />
      </div>
      {error && <p className="text-danger-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 min-h-[44px] rounded-xl bg-emerald-500 text-ink-950 font-medium"
        >
          Save class
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
