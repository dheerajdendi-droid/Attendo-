const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const googleAuth = require("../lib/googleAuth");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const PIN_PATTERN = /^\d{4,6}$/;

function isOwnerEmail(email) {
  const owner = (process.env.OWNER_EMAIL || "").toLowerCase().trim();
  return !!owner && !!email && email.toLowerCase().trim() === owner;
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again in a few minutes." },
});

router.get("/me", async (req, res) => {
  const { rows } = await pool.query("SELECT pin_hash, studio_name FROM settings WHERE id = 1");
  const pinSet = !!(rows[0] && rows[0].pin_hash);
  const studioName = rows[0] && rows[0].studio_name;
  res.json({ authenticated: !!(req.session && req.session.authenticated), pinSet, studioName });
});

// Social sign-in: both providers gate on the same OWNER_EMAIL — whichever
// provider's verified email matches, the login succeeds. Single-owner app,
// no separate per-provider allowlists to keep in sync.
router.post("/google", loginLimiter, async (req, res) => {
  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ error: "Missing credential" });
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ error: "Google sign-in isn't configured" });

  let payload;
  try {
    payload = await googleAuth.verifyGoogleToken(credential, process.env.GOOGLE_CLIENT_ID);
  } catch {
    return res.status(401).json({ error: "Invalid Google credential" });
  }

  if (!payload.email_verified || !isOwnerEmail(payload.email)) {
    return res.status(403).json({ error: "This Google account isn't authorized" });
  }

  req.session.authenticated = true;
  res.json({ ok: true });
});

router.post("/facebook", loginLimiter, async (req, res) => {
  const { accessToken } = req.body || {};
  if (!accessToken) return res.status(400).json({ error: "Missing accessToken" });
  if (!process.env.FACEBOOK_APP_ID) return res.status(503).json({ error: "Facebook sign-in isn't configured" });

  let email;
  try {
    // Verify server-side against the Graph API rather than trusting a
    // client-asserted email — the token itself proves the account.
    const resp = await fetch(
      `https://graph.facebook.com/me?fields=email&access_token=${encodeURIComponent(accessToken)}`
    );
    const data = await resp.json();
    if (data.error) throw new Error(data.error.message);
    email = data.email;
  } catch {
    return res.status(401).json({ error: "Invalid Facebook credential" });
  }

  if (!isOwnerEmail(email)) {
    return res.status(403).json({ error: "This Facebook account isn't authorized" });
  }

  req.session.authenticated = true;
  res.json({ ok: true });
});

// First-run: set the PIN when none exists yet.
router.post("/setup", async (req, res) => {
  const { pin } = req.body || {};
  if (!PIN_PATTERN.test(pin || "")) {
    return res.status(400).json({ error: "PIN must be 4-6 digits" });
  }

  const { rows } = await pool.query("SELECT pin_hash FROM settings WHERE id = 1");
  if (rows[0] && rows[0].pin_hash) {
    return res.status(409).json({ error: "PIN already set" });
  }

  const hash = await bcrypt.hash(pin, 10);
  await pool.query("UPDATE settings SET pin_hash = $1, updated_at = now() WHERE id = 1", [hash]);

  req.session.authenticated = true;
  res.json({ ok: true });
});

router.post("/login", loginLimiter, async (req, res) => {
  const { pin } = req.body || {};
  const { rows } = await pool.query("SELECT pin_hash FROM settings WHERE id = 1");
  const pinHash = rows[0] && rows[0].pin_hash;

  if (!pinHash) {
    return res.status(409).json({ error: "No PIN set up yet" });
  }

  const valid = pin && (await bcrypt.compare(pin, pinHash));
  if (!valid) {
    return res.status(401).json({ error: "Incorrect PIN" });
  }

  req.session.authenticated = true;
  res.json({ ok: true });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.put("/pin", requireAuth, async (req, res) => {
  const { currentPin, newPin } = req.body || {};
  if (!PIN_PATTERN.test(newPin || "")) {
    return res.status(400).json({ error: "New PIN must be 4-6 digits" });
  }

  const { rows } = await pool.query("SELECT pin_hash FROM settings WHERE id = 1");
  const pinHash = rows[0] && rows[0].pin_hash;
  const valid = pinHash && currentPin && (await bcrypt.compare(currentPin, pinHash));
  if (!valid) {
    return res.status(401).json({ error: "Current PIN is incorrect" });
  }

  const hash = await bcrypt.hash(newPin, 10);
  await pool.query("UPDATE settings SET pin_hash = $1, updated_at = now() WHERE id = 1", [hash]);
  res.json({ ok: true });
});

module.exports = router;
