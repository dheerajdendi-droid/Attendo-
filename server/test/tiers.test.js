const app = require("../index");
const { resetDb, authedAgent, createClass, createStudent, TIER_IDS } = require("./helpers");

describe("tiers", () => {
  let agent;

  beforeAll(async () => {
    await resetDb();
    agent = await authedAgent(app);
  });

  beforeEach(async () => {
    await resetDb();
  });

  it("lists tiers ordered by sort_order", async () => {
    const res = await agent.get("/api/tiers");
    expect(res.body.map((t) => t.name)).toEqual(["Junior", "Intermediate", "Senior"]);
  });

  it("creates, renames, and reprices a tier", async () => {
    const created = await agent.post("/api/tiers").send({ name: "1:1 Private", rate: 20 });
    expect(created.status).toBe(201);

    const updated = await agent
      .put(`/api/tiers/${created.body.id}`)
      .send({ name: "Private Coaching", rate: 25 });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ name: "Private Coaching", rate: "25.00" });
  });

  it("rejects a non-positive rate", async () => {
    const res = await agent.post("/api/tiers").send({ name: "Free trial", rate: 0 });
    expect(res.status).toBe(400);
  });

  it("refuses to delete a tier that's still in use", async () => {
    const cls = await createClass(agent);
    await createStudent(agent, cls.id, { tier_id: TIER_IDS.junior });

    const res = await agent.delete(`/api/tiers/${TIER_IDS.junior}`);
    expect(res.status).toBe(409);
  });

  it("deletes a tier with no students on it", async () => {
    const created = await agent.post("/api/tiers").send({ name: "Unused", rate: 10 });
    const res = await agent.delete(`/api/tiers/${created.body.id}`);
    expect(res.status).toBe(204);
  });
});
