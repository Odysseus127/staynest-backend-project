import test from "node:test";
import assert from "node:assert/strict";
import {
  bookingListQuerySchema,
  userListQuerySchema,
} from "./admin-query.js";

test("applies safe defaults to admin list pagination", () => {
  assert.deepEqual(bookingListQuerySchema.parse({}), { page: 1, limit: 20 });
  assert.deepEqual(userListQuerySchema.parse({}), { page: 1, limit: 20 });
});

test("parses supported filters and bounded pagination", () => {
  assert.deepEqual(
    bookingListQuerySchema.parse({
      status: "CONFIRMED",
      hotelId: "12",
      userId: "34",
      from: "2026-10-01",
      to: "2026-10-31",
      page: "3",
      limit: "100",
    }),
    {
      status: "CONFIRMED",
      hotelId: 12,
      userId: 34,
      from: "2026-10-01",
      to: "2026-10-31",
      page: 3,
      limit: 100,
    }
  );
  assert.equal(userListQuerySchema.parse({ role: "ADMIN" }).role, "ADMIN");
});

test("rejects invalid pagination, filters, and date ranges", () => {
  for (const query of [
    { page: "0" },
    { page: "-1" },
    { page: "1.5" },
    { page: "1000001" },
    { limit: "101" },
    { limit: "0" },
    { hotelId: "1.5" },
    { hotelId: "2147483648" },
    { status: "UNKNOWN" },
    { from: "2026-02-29" },
    { from: "2026-11-01", to: "2026-10-01" },
  ]) {
    assert.equal(bookingListQuerySchema.safeParse(query).success, false, JSON.stringify(query));
  }

  assert.equal(userListQuerySchema.safeParse({ role: "GUEST" }).success, false);
  assert.equal(userListQuerySchema.safeParse({ limit: "101" }).success, false);
});
