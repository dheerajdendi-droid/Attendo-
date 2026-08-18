const { pool } = require("../db");

async function billingRows({ month } = {}) {
  const params = [];
  let where = "";
  if (month) {
    params.push(month);
    where = `WHERE to_char(ar.session_date, 'YYYY-MM') = $${params.length}`;
  }

  const { rows } = await pool.query(
    `
    SELECT s.id AS student_id, s.name AS student_name, s.parent_phone,
           s.class_id, c.name AS class_name,
           rt.id AS tier_id, rt.name AS tier_name,
           to_char(ar.session_date, 'YYYY-MM') AS month,
           COUNT(ar.id)::int AS sessions,
           rt.rate AS rate,
           COALESCE(p.paid, false) AS paid,
           p.paid_date
    FROM attendance_records ar
    JOIN students s ON s.id = ar.student_id
    JOIN rate_tiers rt ON rt.id = s.tier_id
    LEFT JOIN classes c ON c.id = s.class_id
    LEFT JOIN payments p ON p.student_id = s.id AND p.month = to_char(ar.session_date, 'YYYY-MM')
    ${where}
    GROUP BY s.id, s.name, s.parent_phone, s.class_id, c.name,
             rt.id, rt.name, rt.rate,
             to_char(ar.session_date, 'YYYY-MM'), p.paid, p.paid_date
    ORDER BY month, class_name NULLS LAST, s.name
    `,
    params
  );

  return rows.map((r) => ({
    studentId: r.student_id,
    studentName: r.student_name,
    tierId: r.tier_id,
    tierName: r.tier_name,
    parentPhone: r.parent_phone,
    classId: r.class_id,
    className: r.class_name || "Unassigned",
    month: r.month,
    sessions: r.sessions,
    rate: Number(r.rate),
    amount: Number((r.sessions * r.rate).toFixed(2)),
    paid: r.paid,
    paidDate: r.paid_date,
  }));
}

module.exports = { billingRows };
