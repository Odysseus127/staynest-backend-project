import test from "node:test";
import assert from "node:assert/strict";
import {
  getPeakOccupancy,
  getPeakOccupancyAcrossBookings,
} from "./occupancy.js";

test("counts peak concurrent bookings instead of all bookings in the range", () => {
  const bookings = [
    { checkIn: "2026-11-01", checkOut: "2026-11-02" },
    { checkIn: "2026-11-02", checkOut: "2026-11-03" },
    { checkIn: "2026-11-03", checkOut: "2026-11-04" },
  ];

  assert.equal(getPeakOccupancy(bookings, "2026-11-01", "2026-11-04"), 1);
});

test("treats checkout and check-in on the same day as non-overlapping", () => {
  const bookings = [
    { checkIn: "2026-11-01", checkOut: "2026-11-03" },
    { checkIn: "2026-11-03", checkOut: "2026-11-05" },
  ];

  assert.equal(getPeakOccupancy(bookings, "2026-11-01", "2026-11-05"), 1);
});

test("clips bookings to the requested date range", () => {
  const bookings = [
    { checkIn: "2026-10-30", checkOut: "2026-11-03" },
    { checkIn: "2026-11-02", checkOut: "2026-11-06" },
  ];

  assert.equal(getPeakOccupancy(bookings, "2026-11-01", "2026-11-05"), 2);
});

test("returns zero when no active bookings overlap", () => {
  assert.equal(getPeakOccupancy([], "2026-11-01", "2026-11-05"), 0);
});

test("calculates peak occupancy across all active booking dates", () => {
  const bookings = [
    { checkIn: "2026-11-01", checkOut: "2026-11-04" },
    { checkIn: "2026-11-02", checkOut: "2026-11-03" },
    { checkIn: "2026-11-04", checkOut: "2026-11-06" },
  ];

  assert.equal(getPeakOccupancyAcrossBookings(bookings), 2);
  assert.equal(getPeakOccupancyAcrossBookings([]), 0);
});
