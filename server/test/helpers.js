const request = require("supertest");
const { Pool } = require("pg");

let pool;
function getPool() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

// Deterministic tier ids: resetDb() always (re)inserts these three tiers in
// this order right after a sequence-resetting TRUNCATE, so the ids are
// guaranteed to come out 1/2/3 every time.
const TIER_IDS = { junior: 1, intermediate: 2, senior: 3 };

// Wipes all app data (not the session store, not the PIN) so every test
// file starts from a clean slate and builds exactly the fixtures it needs.
async function resetDb() {
  const client = getPool();
  await client.query(
    "TRUNCATE classes, students, attendance_records, payments, session_outgoings, rate_tiers RESTART IDENTITY CASCADE"
  );
  await client.query(
    `INSERT INTO rate_tiers (name, rate, sort_order) VALUES
      ('Junior', 5.00, 1), ('Intermediate', 8.00, 2), ('Senior', 7.00, 3)`
  );
  await client.query(
    "UPDATE settings SET studio_name = 'Test Studio', currency_symbol = '£', updated_at = now() WHERE id = 1"
  );
}

// Returns a Supertest agent that's authenticated for the rest of the test
// file. Handles both "no PIN set yet" (first file to run) and "PIN already
// set by an earlier file" (falls back to login) transparently.
async function authedAgent(app) {
  const agent = request.agent(app);
  const setupRes = await agent.post("/api/auth/setup").send({ pin: "1234" });
  if (setupRes.status === 409) {
    const loginRes = await agent.post("/api/auth/login").send({ pin: "1234" });
    if (loginRes.status !== 200) {
      throw new Error(`Test auth failed: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
    }
  } else if (setupRes.status !== 200) {
    throw new Error(`Test auth setup failed: ${setupRes.status} ${JSON.stringify(setupRes.body)}`);
  }
  return agent;
}

async function createClass(agent, overrides = {}) {
  const res = await agent
    .post("/api/classes")
    .send({ name: "Test Class", day_of_week: "Saturday", time: "10:00", ...overrides });
  return res.body;
}

async function createStudent(agent, classId, overrides = {}) {
  const res = await agent
    .post("/api/students")
    .send({ name: "Test Student", tier_id: TIER_IDS.junior, class_id: classId, ...overrides });
  return res.body;
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

module.exports = { getPool, resetDb, authedAgent, createClass, createStudent, currentMonth, TIER_IDS };
