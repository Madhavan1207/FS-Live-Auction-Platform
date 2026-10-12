import { describe, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// These tests run in CI on every push (Experiment 9), so they must not need
// a real database. Each Mongoose model's methods are replaced with small
// in-memory versions; everything else (Express, Joi validation, JWT, bcrypt,
// role checks, rate limiting, Helmet) is the real code.
process.env.JWT_SECRET = "ci_test_secret";
process.env.FRONTEND_ORIGIN = "http://localhost:5173";

const { default: app } = await import("../src/app.js");
const { default: User } = await import("../src/models/User.js");
const { default: Item } = await import("../src/models/Item.js");
const { default: Bid } = await import("../src/models/Bid.js");
const { default: vercelHandler } = await import("../api/index.js");

const newId = () => new mongoose.Types.ObjectId().toString();
const safe = (u) => {
  const { password: _password, ...rest } = u;
  return rest;
};

// ---------- in-memory stand-ins for the database ----------
const users = [];
const items = [];

User.findOne = async ({ email }) => {
  const found = users.find((u) => u.email === email);
  return found
    ? { ...found, comparePassword: (p) => bcrypt.compare(p, found.password) }
    : null;
};
User.findById = (id) => {
  const found = users.find((u) => u._id === id);
  const result = Promise.resolve(found ? safe(found) : null);
  result.select = async () => (found ? safe(found) : null);
  return result;
};
User.find = () => ({ select: async () => users.map(safe) });
User.create = async (data) => {
  const doc = { _id: newId(), ...data, password: await bcrypt.hash(data.password, 4) };
  users.push(doc);
  return doc;
};

Item.find = () => ({ sort: async () => [...items] });
Item.create = async (data) => {
  const doc = { _id: newId(), ...data, bidCount: 0 };
  items.push(doc);
  return doc;
};
Item.findById = async (id) => {
  const found = items.find((i) => i._id === id);
  return found
    ? {
        ...found,
        save: async function () {
          Object.assign(found, this);
          return found;
        },
      }
    : null;
};
Bid.create = async (data) => ({ _id: newId(), ...data });

// ---------- helpers ----------
const addUser = (name, role) => {
  const user = { _id: newId(), name, email: `${name}@test.com`, role, password: "x" };
  users.push(user);
  return { user, token: jwt.sign({ id: user._id }, process.env.JWT_SECRET) };
};
const seller = addUser("seller", "seller");
const buyer = addUser("buyer", "buyer");
const admin = addUser("admin", "admin");
const auth = (who) => ({ Authorization: `Bearer ${who.token}` });

const hoursFromNow = (h) => new Date(Date.now() + h * 3600 * 1000).toISOString();
const validItem = () => ({
  title: "Vintage Armchair",
  description: "A well kept mid-century armchair.",
  startingPrice: 100,
  closingAt: hoursFromNow(24),
});

// ---------- tests ----------
describe("health and security", () => {
  test("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
  });

  test("Helmet security headers are present", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.headers["x-content-type-options"], "nosniff");
  });

  test("unknown API route returns 404", async () => {
    const res = await request(app).get("/api/does-not-exist");
    assert.equal(res.status, 404);
  });
});

describe("authentication", () => {
  test("register rejects an invalid body with details", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "x" });
    assert.equal(res.status, 400);
    assert.ok(res.body.details.length > 0);
  });

  test("register then login returns a token, wrong password is rejected", async () => {
    const body = { name: "Priya Sharma", email: "priya@test.com", password: "password123", role: "buyer" };
    const reg = await request(app).post("/api/auth/register").send(body);
    assert.equal(reg.status, 201);
    assert.ok(reg.body.token);
    assert.equal(reg.body.user.password, undefined);

    const good = await request(app)
      .post("/api/auth/login")
      .send({ email: body.email, password: body.password });
    assert.equal(good.status, 200);

    const bad = await request(app)
      .post("/api/auth/login")
      .send({ email: body.email, password: "wrongpassword" });
    assert.equal(bad.status, 401);
  });

  test("stored password is a bcrypt hash, not plain text", () => {
    const stored = users.find((u) => u.email === "priya@test.com");
    assert.ok(stored.password.startsWith("$2"));
    assert.notEqual(stored.password, "password123");
  });

  test("GET /api/auth/me requires a token", async () => {
    const res = await request(app).get("/api/auth/me");
    assert.equal(res.status, 401);
  });
});

describe("items", () => {
  test("creating an item without a token is rejected (401)", async () => {
    const res = await request(app).post("/api/items").send(validItem());
    assert.equal(res.status, 401);
  });

  test("a buyer cannot create an item (403)", async () => {
    const res = await request(app).post("/api/items").set(auth(buyer)).send(validItem());
    assert.equal(res.status, 403);
  });

  test("a seller sending an invalid body gets 400", async () => {
    const res = await request(app).post("/api/items").set(auth(seller)).send({ title: "ab" });
    assert.equal(res.status, 400);
  });

  test("a seller can create an item, seller id comes from the token", async () => {
    const res = await request(app).post("/api/items").set(auth(seller)).send(validItem());
    assert.equal(res.status, 201);
    assert.equal(res.body.seller, seller.user._id);
    assert.equal(res.body.currentBid, 100);
  });

  test("listing items is public", async () => {
    const res = await request(app).get("/api/items");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });
});

describe("bids", () => {
  const openItem = { _id: newId(), title: "Open", currentBid: 100, bidCount: 0, seller: newId(), closingAt: new Date(Date.now() + 3600 * 1000) };
  const closedItem = { _id: newId(), title: "Closed", currentBid: 100, bidCount: 0, seller: newId(), closingAt: new Date(Date.now() - 60 * 1000) };
  items.push(openItem, closedItem);

  test("bidding without a token is rejected (401)", async () => {
    const res = await request(app).post(`/api/items/${openItem._id}/bids`).send({ amount: 500 });
    assert.equal(res.status, 401);
  });

  test("a seller cannot bid (403)", async () => {
    const res = await request(app).post(`/api/items/${openItem._id}/bids`).set(auth(seller)).send({ amount: 500 });
    assert.equal(res.status, 403);
  });

  test("a bid below the current price is rejected (400)", async () => {
    const res = await request(app).post(`/api/items/${openItem._id}/bids`).set(auth(buyer)).send({ amount: 50 });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /must be higher/);
  });

  test("a negative bid is rejected by validation (400)", async () => {
    const res = await request(app).post(`/api/items/${openItem._id}/bids`).set(auth(buyer)).send({ amount: -5 });
    assert.equal(res.status, 400);
  });

  test("a valid bid succeeds and the bidder name comes from the token", async () => {
    const res = await request(app).post(`/api/items/${openItem._id}/bids`).set(auth(buyer)).send({ amount: 150 });
    assert.equal(res.status, 201);
    assert.equal(res.body.item.currentBid, 150);
    assert.equal(res.body.bid.bidderName, "buyer");
    assert.equal(res.body.extended, false);
  });

  test("a bid after the closing time is rejected (400)", async () => {
    const res = await request(app).post(`/api/items/${closedItem._id}/bids`).set(auth(buyer)).send({ amount: 500 });
    assert.equal(res.status, 400);
    assert.equal(res.body.message, "This auction has already closed");
  });

  test("a bid in the last 30 seconds extends the closing time by 30 seconds", async () => {
    const closing = new Date(Date.now() + 10 * 1000);
    const lateItem = { _id: newId(), title: "Late", currentBid: 10, bidCount: 0, seller: newId(), closingAt: closing };
    items.push(lateItem);
    const res = await request(app).post(`/api/items/${lateItem._id}/bids`).set(auth(buyer)).send({ amount: 20 });
    assert.equal(res.status, 201);
    assert.equal(res.body.extended, true);
    assert.equal(new Date(res.body.item.closingAt).getTime() - closing.getTime(), 30000);
  });
});

describe("admin-only routes", () => {
  test("a buyer cannot list users (403)", async () => {
    const res = await request(app).get("/api/users").set(auth(buyer));
    assert.equal(res.status, 403);
  });

  test("an admin can list users and no password is leaked", async () => {
    const res = await request(app).get("/api/users").set(auth(admin));
    assert.equal(res.status, 200);
    assert.ok(res.body.every((u) => u.password === undefined));
  });
});

describe("Vercel serverless entry (api/index.js)", () => {
  test("serves requests through the Express app and connects to MongoDB once", async () => {
    let connectCalls = 0;
    mongoose.connect = async () => {
      connectCalls += 1;
    };
    const first = await request(vercelHandler).get("/api/health");
    const second = await request(vercelHandler).get("/api/health");
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(connectCalls, 1, "the connection must be reused, not reopened per request");
  });
});