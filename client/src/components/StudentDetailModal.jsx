import Avatar from "./Avatar.jsx";
import { useStudentHistory, useTogglePayment, useSettings } from "../lib/useRoster.js";
import { formatMonth } from "../lib/date.js";

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function StudentDetailModal({ studentId, onClose }) {
  const { data, isLoading } = useStudentHistory(studentId);
  const togglePayment = useTogglePayment();
  const { data: settings } = useSettings();
  const currencySymbol = (settings && settings.currency_symbol) || "£";

  return (
    <div className="fixed inset-0 z-30 bg-ink-950/70 flex items-end sm:items-center sm:justify-center">
      <div className="bg-ink-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        {isLoading || !data ? (
          <div className="p-6 text-center text-ink-400">Loading…</div>
        ) : (
          <>
            <div className="sticky top-0 bg-ink-900 px-4 pt-4 pb-3 border-b border-ink-600 flex items-center gap-3">
              <Avatar name={data.student.name} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-xl font-semibold truncate">{data.student.name}</p>
                <p className="text-sm text-ink-400">
                  {data.student.tier_name} · {currencySymbol}{Number(data.student.rate).toFixed(2)}/session
                  {data.student.parent_phone ? ` · ${data.student.parent_phone}` : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] rounded-full bg-ink-700 text-ink-100 text-lg"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              {data.months.length === 0 && (
                <p className="text-ink-400 text-sm text-center py-6">No attendance recorded yet.</p>
              )}
              {data.months.map((m) => (
                <div key={m.month} className="bg-ink-800 rounded-2xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{formatMonth(m.month)}</p>
                    <button
                      onClick={() =>
                        togglePayment.mutate({ studentId, month: m.month, paid: !m.paid })
                      }
                      className={`min-h-[36px] px-3 rounded-full text-sm font-semibold ${
                        m.paid ? "bg-emerald-500 text-ink-950" : "bg-ink-700 text-ink-100"
                      }`}
                    >
                      {m.paid ? "Paid" : "Unpaid"}
                    </button>
                  </div>
                  <p className="text-sm text-ink-200 mt-1">
                    {m.sessions} session{m.sessions === 1 ? "" : "s"} · {currencySymbol}{m.amountOwed.toFixed(2)}
                  </p>
                  <p className="text-xs text-ink-400 mt-2">
                    {m.dates.map((d) => formatDate(d)).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
