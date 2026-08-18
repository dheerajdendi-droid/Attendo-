import { useMemo, useState } from "react";
import RatesCard from "../components/RatesCard.jsx";
import BrandingCard from "../components/BrandingCard.jsx";
import ClassForm from "../components/ClassForm.jsx";
import ClassCard from "../components/ClassCard.jsx";
import StudentForm from "../components/StudentForm.jsx";
import StudentDetailModal from "../components/StudentDetailModal.jsx";
import Avatar from "../components/Avatar.jsx";
import {
  useClasses,
  useStudents,
  useCreateClass,
  useCreateStudent,
  useDeleteStudent,
  useSettings,
} from "../lib/useRoster.js";

export default function Students() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: settings } = useSettings();
  const createClass = useCreateClass();
  const createStudent = useCreateStudent();
  const deleteStudent = useDeleteStudent();
  const currencySymbol = (settings && settings.currency_symbol) || "£";

  const [addingClass, setAddingClass] = useState(false);
  const [addingUnassigned, setAddingUnassigned] = useState(false);
  const [openStudentId, setOpenStudentId] = useState(null);

  const studentsByClass = useMemo(() => {
    const map = new Map();
    (students || []).forEach((s) => {
      const key = s.class_id || "unassigned";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    });
    return map;
  }, [students]);

  const unassigned = studentsByClass.get("unassigned") || [];

  if (classesLoading || studentsLoading) {
    return <p className="p-4 text-ink-400">Loading roster…</p>;
  }

  return (
    <div className="pb-6">
      <BrandingCard />
      <RatesCard />

      <div className="mx-4 mt-6 mb-2 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Classes</h2>
        {!addingClass && (
          <button
            onClick={() => setAddingClass(true)}
            className="min-h-[40px] px-3 rounded-xl bg-emerald-500 text-ink-950 text-sm font-medium"
          >
            + Add class
          </button>
        )}
      </div>

      {addingClass && (
        <div className="mx-4 mb-4">
          <ClassForm
            onSave={(data) => createClass.mutate(data, { onSuccess: () => setAddingClass(false) })}
            onCancel={() => setAddingClass(false)}
            saving={createClass.isPending}
          />
        </div>
      )}

      <div className="space-y-4">
        {classes.map((c) => (
          <ClassCard
            key={c.id}
            classInfo={c}
            students={studentsByClass.get(c.id) || []}
            onOpenStudent={setOpenStudentId}
          />
        ))}
      </div>

      {classes.length === 0 && !addingClass && (
        <p className="mx-4 text-ink-400 text-sm">No classes yet — add your first one above.</p>
      )}

      <div className="mx-4 mt-6">
        <h2 className="font-display text-lg font-semibold mb-2">Unassigned students</h2>
        <div className="bg-ink-800 rounded-2xl shadow-sm p-3 space-y-2">
          {unassigned.map((s) => (
            <button
              key={s.id}
              onClick={() => setOpenStudentId(s.id)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-ink-700/60 text-left"
            >
              <Avatar name={s.name} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.name}</p>
                <p className="text-xs text-ink-400">
                  {s.tier_name} · {currencySymbol}{Number(s.rate).toFixed(2)}
                </p>
              </div>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Remove ${s.name}?`)) deleteStudent.mutate(s.id);
                }}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-ink-300 text-lg"
                role="button"
                aria-label={`Remove ${s.name}`}
              >
                ✕
              </span>
            </button>
          ))}
          {unassigned.length === 0 && !addingUnassigned && (
            <p className="text-ink-400 text-sm px-2 py-1">No unassigned students.</p>
          )}
          {addingUnassigned ? (
            <StudentForm
              onSave={(data) =>
                createStudent.mutate(
                  { ...data, class_id: null },
                  { onSuccess: () => setAddingUnassigned(false) }
                )
              }
              onCancel={() => setAddingUnassigned(false)}
              saving={createStudent.isPending}
            />
          ) : (
            <button
              onClick={() => setAddingUnassigned(true)}
              className="w-full min-h-[44px] rounded-xl border border-dashed border-ink-600 text-ink-400 font-medium"
            >
              + Add student without a class
            </button>
          )}
        </div>
      </div>

      {openStudentId && (
        <StudentDetailModal studentId={openStudentId} onClose={() => setOpenStudentId(null)} />
      )}
    </div>
  );
}
