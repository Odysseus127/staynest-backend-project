import test from "node:test";
import assert from "node:assert/strict";
import {
  dateOnlyDaysBetween,
  getUtcDateOnly,
  isValidDateOnly,
} from "./date.js";

test("validates real calendar dates, including leap years", () => {
  assert.equal(isValidDateOnly("2024-02-29"), true);
  assert.equal(isValidDateOnly("2025-02-29"), false);
  assert.equal(isValidDateOnly("2026-04-31"), false);
  assert.equal(isValidDateOnly("1900-02-29"), false);
  assert.equal(isValidDateOnly("2000-02-29"), true);
});

test("requires the exact YYYY-MM-DD format and MySQL-supported years", () => {
  assert.equal(isValidDateOnly("2026-1-01"), false);
  assert.equal(isValidDateOnly("0999-12-31"), false);
  assert.equal(isValidDateOnly("2026-00-10"), false);
  assert.equal(isValidDateOnly("2026-12-00"), false);
});

test("calculates stay nights as calendar days, independent of DST", () => {
  assert.equal(dateOnlyDaysBetween("2026-03-08", "2026-03-09"), 1);
  assert.equal(dateOnlyDaysBetween("2024-02-28", "2024-03-01"), 2);
});

test("gets the current calendar date in UTC", () => {
  assert.equal(getUtcDateOnly(new Date("2026-10-28T23:59:59.000Z")), "2026-10-28");
});
