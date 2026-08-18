const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT studio_name, currency_symbol FROM settings WHERE id = 1"
  );
  res.json(rows[0]);
});

router.put("/", async (req, res) => {
  const { studio_name, currency_symbol } = req.body || {};
  const name = (studio_name || "").trim();
  const symbol = (currency_symbol || "").trim();

  if (!name || name.length > 60) {
    return res.status(400).json({ error: "Studio name must be 1-60 characters" });
  }
  if (!symbol || symbol.length > 3) {
    return res.status(400).json({ error: "Currency symbol must be 1-3 characters" });
  }

  const { rows } = await pool.query(
    "UPDATE settings SET studio_name = $1, currency_symbol = $2, updated_at = now() WHERE id = 1 RETURNING studio_name, currency_symbol",
    [name, symbol]
  );
  res.json(rows[0]);
});

module.exports = router;
