import Avatar from "./Avatar.jsx";

export default function AttendanceCard({ student, present, onToggle }) {
  return (
    <button
      onClick={() => onToggle(student.id, !present)}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl p-3 min-h-[104px] border-2 transition-colors ${
        present
          ? "bg-emerald-500 border-emerald-500 text-ink-950"
          : "bg-ink-800 border-ink-600 text-ink-100"
      }`}
    >
      {present && (
        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-ink-950 text-emerald-500 text-xs flex items-center justify-center font-bold">
          ✓
        </span>
      )}
      <Avatar name={student.name} />
      <span className="text-sm font-medium text-center leading-tight line-clamp-2">
        {student.name}
      </span>
    </button>
  );
}
