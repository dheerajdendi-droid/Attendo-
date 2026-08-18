const request = require("supertest");
const app = require("../index");
const { resetDb, getPool } = require("./helpers");
const googleAuth = require("../lib/googleAuth");

describe("auth", () => {
  beforeEach(async () => {
    await resetDb();
    // resetDb() doesn't touch pin_hash — clear it explicitly so each test
    // in this file starts from a genuine "no PIN set" state.
    await getPool().query("UPDATE settings SET pin_hash = NULL WHERE id = 1");
  });

  it("rejects a PIN that isn't 4-6 digits", async () => {
    const res = await request(app).post("/api/auth/setup").send({ pin: "12" });
    expect(res.status).toBe(400);
  });

  it("sets up a PIN and authenticates the session", async () => {
    const agent = request.agent(app);
    const setupRes = await agent.post("/api/auth/setup").send({ pin: "1234" });
    expect(setupRes.status).toBe(200);

    const meRes = await agent.get("/api/auth/me");
    expect(meRes.body).toEqual({ authenticated: true, pinSet: true, studioName: "Test Studio" });
  });

  it("refuses to set up a PIN twice", async () => {
    await request.agent(app).post("/api/auth/setup").send({ pin: "1234" });
    const res = await request(app).post("/api/auth/setup").send({ pin: "5678" });
    expect(res.status).toBe(409);
  });

  it("rejects an incorrect PIN on login", async () => {
    await request.agent(app).post("/api/auth/setup").send({ pin: "1234" });
    const res = await request(app).post("/api/auth/login").send({ pin: "9999" });
    expect(res.status).toBe(401);
  });

  it("accepts the correct PIN on login", async () => {
    await request.agent(app).post("/api/auth/setup").send({ pin: "1234" });
    const agent = request.agent(app);
    const res = await agent.post("/api/auth/login").send({ pin: "1234" });
    expect(res.status).toBe(200);
  });

  it("blocks protected routes without a session", async () => {
    const res = await request(app).get("/api/classes");
    expect(res.status).toBe(401);
  });

  describe("google sign-in", () => {
    const OLD_ENV = process.env;
    const OLD_VERIFY = googleAuth.verifyGoogleToken;
    beforeEach(() => {
      process.env = { ...OLD_ENV, GOOGLE_CLIENT_ID: "test-client-id", OWNER_EMAIL: "owner@example.com" };
    });
    afterEach(() => {
      process.env = OLD_ENV;
      // Reassigning the module's export (not destructured) so the route,
      // which calls googleAuth.verifyGoogleToken(...) via property access,
      // picks up the stub — plain CJS module-object mutation, no mocking
      // library needed and no node_modules-externalization issues to fight.
      googleAuth.verifyGoogleToken = OLD_VERIFY;
    });

    it("503s when Google sign-in isn't configured", async () => {
      process.env.GOOGLE_CLIENT_ID = "";
      const res = await request(app).post("/api/auth/google").send({ credential: "token" });
      expect(res.status).toBe(503);
    });

    it("authenticates the session for the owner's verified email", async () => {
      googleAuth.verifyGoogleToken = async () => ({ email: "owner@example.com", email_verified: true });

      const agent = request.agent(app);
      const res = await agent.post("/api/auth/google").send({ credential: "token" });
      expect(res.status).toBe(200);

      const meRes = await agent.get("/api/auth/me");
      expect(meRes.body.authenticated).toBe(true);
    });

    it("rejects a verified email that isn't the owner's", async () => {
      googleAuth.verifyGoogleToken = async () => ({ email: "someone-else@example.com", email_verified: true });

      const res = await request(app).post("/api/auth/google").send({ credential: "token" });
      expect(res.status).toBe(403);
    });
  });

  describe("facebook sign-in", () => {
    const OLD_ENV = process.env;
    const OLD_FETCH = global.fetch;
    beforeEach(() => {
      process.env = { ...OLD_ENV, FACEBOOK_APP_ID: "test-app-id", OWNER_EMAIL: "owner@example.com" };
    });
    afterEach(() => {
      process.env = OLD_ENV;
      global.fetch = OLD_FETCH;
    });

    it("503s when Facebook sign-in isn't configured", async () => {
      process.env.FACEBOOK_APP_ID = "";
      const res = await request(app).post("/api/auth/facebook").send({ accessToken: "token" });
      expect(res.status).toBe(503);
    });

    it("authenticates the session for the owner's verified email", async () => {
      global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ email: "owner@example.com" }) });

      const agent = request.agent(app);
      const res = await agent.post("/api/auth/facebook").send({ accessToken: "token" });
      expect(res.status).toBe(200);

      const meRes = await agent.get("/api/auth/me");
      expect(meRes.body.authenticated).toBe(true);
    });

    it("rejects a verified email that isn't the owner's", async () => {
      global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ email: "someone-else@example.com" }) });

      const res = await request(app).post("/api/auth/facebook").send({ accessToken: "token" });
      expect(res.status).toBe(403);
    });
  });
});
