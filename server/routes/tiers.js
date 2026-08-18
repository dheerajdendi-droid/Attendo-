const express = require("express");
const { pool } = require("../db");

const router = express.Router();

function validateTierInput(body, { partial = false } = {}) {
  const { name, rate } = body || {};
  if (!partial || name !== undefined) {
    if (!name || !name.trim()) return "Tier name is required";
  }
  if (!partial || rate !== undefined) {
    const r = Number(rate);
    if (!Number.isFinite(r) || r <= 0) return "Rate must be a positive number";
  }
  return null;
}

router.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM rate_tiers ORDER BY sort_order, id");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const error = validateTierInput(req.body);
  if (error) return res.status(400).json({ error });

  const { name, rate, sort_order } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO rate_tiers (name, rate, sort_order) VALUES ($1, $2, $3) RETURNING *",
    [name.trim(), Number(rate), Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0]
  );
  res.status(201).json(rows[0]);
});

router.put("/:id", async (req, res) => {
  const error = validateTierInput(req.body, { partial: true });
  if (error) return res.status(400).json({ error });

  const existing = await pool.query("SELECT * FROM rate_tiers WHERE id = $1", [req.params.id]);
  if (!existing.rows[0]) return res.status(404).json({ error: "Tier not found" });
  const current = existing.rows[0];

  const name = req.body.name !== undefined ? req.body.name.trim() : current.name;
  const rate = req.body.rate !== undefined ? Number(req.body.rate) : current.rate;
  const sort_order = req.body.sort_order !== undefined ? Number(req.body.sort_order) : current.sort_order;

  const { rows } = await pool.query(
    "UPDATE rate_tiers SET name = $1, rate = $2, sort_order = $3 WHERE id = $4 RETURNING *",
    [name, rate, sort_order, req.params.id]
  );
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { rows: countRows } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM students WHERE tier_id = $1 AND active",
    [req.params.id]
  );
  const inUseCount = countRows[0].count;
  if (inUseCount > 0) {
    return res.status(409).json({
      error: `Tier is in use by ${inUseCount} student${inUseCount === 1 ? "" : "s"}`,
    });
  }

  try {
    const { rowCount } = await pool.query("DELETE FROM rate_tiers WHERE id = $1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: "Tier not found" });
    res.status(204).end();
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({ error: "Tier is still in use" });
    }
    throw err;
  }
});

module.exports = router;
