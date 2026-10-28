import test, { before } from "node:test";
import assert from "node:assert/strict";

let pool;
let requireAuth;
let signToken;

before(async () => {
  process.env.JWT_SECRET = "test-only-random-secret-with-at-least-32-bytes";
  ({ pool } = await import("../config/db.js"));
  ({ requireAuth } = await import("./auth.js"));
  ({ signToken } = await import("../utils/jwt.js"));
});

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("uses the current database role instead of the JWT role", async (t) => {
  let query;
  t.mock.method(pool, "query", async (...args) => {
    query = args;
    return [[{ id: 7, email: "user@example.test", role: "USER" }]];
  });

  const req = {
    headers: {
      authorization: `Bearer ${signToken({ id: 7, email: "user@example.test", role: "ADMIN" })}`,
    },
  };
  const res = createResponse();
  let nextCalled = false;

  await requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.deepEqual(req.user, { id: 7, email: "user@example.test", role: "USER" });
  assert.deepEqual(query[1], [7]);
  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test("rejects a valid token when its user account no longer exists", async (t) => {
  t.mock.method(pool, "query", async () => [[]]);

  const req = {
    headers: {
      authorization: `Bearer ${signToken({ id: 7, email: "user@example.test", role: "ADMIN" })}`,
    },
  };
  const res = createResponse();

  await requireAuth(req, res, () => assert.fail("next should not be called"));

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, "User account no longer exists");
});

test("forwards database errors to Express error handling", async (t) => {
  const databaseError = new Error("database unavailable");
  t.mock.method(pool, "query", async () => {
    throw databaseError;
  });

  const req = {
    headers: {
      authorization: `Bearer ${signToken({ id: 7, email: "user@example.test", role: "USER" })}`,
    },
  };
  const res = createResponse();
  let forwardedError;

  await requireAuth(req, res, (err) => {
    forwardedError = err;
  });

  assert.equal(forwardedError, databaseError);
});
