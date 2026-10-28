import test from "node:test";
import assert from "node:assert/strict";
import { parseCorsOrigins } from "./cors.js";

test("uses the local frontend origin when no CORS origins are configured", () => {
  assert.deepEqual(parseCorsOrigins(undefined), ["http://localhost:5173"]);
});

test("parses and deduplicates configured exact origins", () => {
  assert.deepEqual(
    parseCorsOrigins("https://staynest.example, http://localhost:5173, https://staynest.example"),
    ["https://staynest.example", "http://localhost:5173"]
  );
});

test("rejects wildcards, paths, opaque origins, and malformed entries", () => {
  for (const origins of [
    "*",
    "https://staynest.example/path",
    "null",
    "ftp://staynest.example",
    "https://staynest.example,",
  ]) {
    assert.throws(() => parseCorsOrigins(origins), undefined, origins);
  }
});
