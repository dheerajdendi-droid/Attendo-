const app = require("../index");
const { resetDb, authedAgent, createClass, createStudent, TIER_IDS } = require("./helpers");

describe("students", () => {
  let agent;

  beforeAll(async () => {
    await resetDb();
    agent = await authedAgent(app);
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("resolves rate from the student's tier", async () => {
    const cls = await createClass(agent);
    await createStudent(agent, cls.id, { name: "Junior Jo", tier_id: TIER_IDS.junior });
    await createStudent(agent, cls.id, { name: "Intermediate Ivy", tier_id: TIER_IDS.intermediate });
    await createStudent(agent, cls.id, { name: "Senior Sam", tier_id: TIER_IDS.senior });

    const res = await agent.get("/api/students");
    const jo = res.body.find((s) => s.name === "Junior Jo");
    const ivy = res.body.find((s) => s.name === "Intermediate Ivy");
    const sam = res.body.find((s) => s.name === "Senior Sam");
    expect(Number(jo.rate)).toBe(5);
    expect(Number(ivy.rate)).toBe(8);
    expect(Number(sam.rate)).toBe(7);
  });

  it("rejects a student with an unknown tier", async () => {
    const cls = await createClass(agent);
    const res = await agent
      .post("/api/students")
      .send({ name: "No Tier", tier_id: 999999, class_id: cls.id });
    expect(res.status).toBe(400);
  });

  it("soft-deletes a student instead of removing the row", async () => {
    const cls = await createClass(agent);
    const student = await createStudent(agent, cls.id);

    const delRes = await agent.delete(`/api/students/${student.id}`);
    expect(delRes.status).toBe(204);

    const activeOnly = await agent.get("/api/students");
    expect(activeOnly.body.find((s) => s.id === student.id)).toBeUndefined();

    const withInactive = await agent.get("/api/students?include_inactive=true");
    const found = withInactive.body.find((s) => s.id === student.id);
    expect(found).toBeDefined();
    expect(found.active).toBe(false);
  });

  it("computes attendance history month totals correctly", async () => {
    const cls = await createClass(agent);
    const student = await createStudent(agent, cls.id, { tier_id: TIER_IDS.junior });

    await agent
      .post("/api/attendance")
      .send({ student_id: student.id, class_id: cls.id, session_date: "2026-03-07" });
    await agent
      .post("/api/attendance")
      .send({ student_id: student.id, class_id: cls.id, session_date: "2026-03-14" });

    const res = await agent.get(`/api/students/${student.id}/history`);
    expect(res.body.months).toHaveLength(1);
    expect(res.body.months[0]).toMatchObject({ month: "2026-03", sessions: 2, amountOwed: 10, paid: false });
  });
});
