#!/usr/bin/env node
/**
 * Contract snapshot runner.
 *
 * Modes:
 *   --mode=capture    overwrite fixtures from live responses
 *   --mode=verify     compare live responses to stored fixtures, fail on diff
 *
 * Runs against the base URL in endpoints.json (can be overridden with API_BASE env).
 *
 * Fixtures are stored as "shape descriptors" (types of fields, not exact values).
 * This is deliberate: the regression we care about is API contract drift, not
 * value churn (new timestamps, new demo seed rows, LLM-generated text).
 *
 * Each snapshot records:
 *   - HTTP status
 *   - Response shape: for objects, the map of field -> type; for arrays, the
 *     element type shape (from first element, if any) plus "arrayLengthAtCapture"
 *     for informational purposes only.
 *
 * Any status change or field-name/type drift fails verify. Value changes do not.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "fixtures");
const configPath = join(__dirname, "endpoints.json");

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.startsWith("--") ? a.slice(2).split("=") : [a, true];
    return [k, v ?? true];
  }),
);
const mode = args.get("mode") || "verify";

if (!["capture", "verify"].includes(mode)) {
  console.error(`Unknown mode: ${mode}. Use --mode=capture or --mode=verify.`);
  process.exit(2);
}

const config = JSON.parse(readFileSync(configPath, "utf8"));
const base = process.env.API_BASE || config.base;

function interpolate(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    if (!(k in values)) throw new Error(`Missing interpolation key: ${k}`);
    return values[k];
  });
}

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function describe(value, depth = 0) {
  if (depth > 6) return { t: "truncated" };
  const t = typeOf(value);
  if (t === "object") {
    const out = {};
    for (const k of Object.keys(value).sort()) {
      out[k] = describe(value[k], depth + 1);
    }
    return { t: "object", fields: out };
  }
  if (t === "array") {
    if (value.length === 0) return { t: "array", element: null };
    return { t: "array", element: describe(value[0], depth + 1) };
  }
  return { t };
}

function shapeEqual(a, b) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  if (a.t !== b.t) return false;
  if (a.t === "object") {
    const ak = Object.keys(a.fields);
    const bk = Object.keys(b.fields);
    if (ak.length !== bk.length) return false;
    for (const k of ak) if (!(k in b.fields)) return false;
    for (const k of ak) if (!shapeEqual(a.fields[k], b.fields[k])) return false;
    return true;
  }
  if (a.t === "array") {
    return shapeEqual(a.element, b.element);
  }
  return true;
}

function shapeDiff(a, b, path = "$") {
  if (a === null && b === null) return [];
  if (a === null) return [`${path}: captured=null, live=${b?.t}`];
  if (b === null) return [`${path}: captured=${a?.t}, live=null`];
  if (a.t !== b.t) return [`${path}: type ${a.t} -> ${b.t}`];
  if (a.t === "object") {
    const out = [];
    const ak = new Set(Object.keys(a.fields));
    const bk = new Set(Object.keys(b.fields));
    for (const k of ak) if (!bk.has(k)) out.push(`${path}.${k}: missing in live`);
    for (const k of bk) if (!ak.has(k)) out.push(`${path}.${k}: new in live`);
    for (const k of ak) {
      if (bk.has(k)) out.push(...shapeDiff(a.fields[k], b.fields[k], `${path}.${k}`));
    }
    return out;
  }
  if (a.t === "array") return shapeDiff(a.element, b.element, `${path}[]`);
  return [];
}

async function login(email, password) {
  const res = await fetch(`${base}${config.authLogin}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed: HTTP ${res.status}`);
  const body = await res.json();
  if (!body.token) throw new Error("Login response missing token");
  return body.token;
}

async function captureOne(ep, token, values) {
  const url =
    (ep.baseOverride ?? base) + interpolate(ep.path, values);
  const init = {
    method: ep.method || "GET",
    headers: {},
  };
  if (ep.auth) init.headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, init);
  const status = res.status;

  if (ep.expectHtml) {
    const text = await res.text();
    const hasTitle = /<title>/.test(text);
    return {
      id: ep.id,
      method: init.method,
      path: ep.path,
      status,
      shape: { t: "html", hasTitle },
    };
  }

  let shape = null;
  let arrayLen = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await res.json();
    if (Array.isArray(body)) arrayLen = body.length;
    shape = describe(body);
  } else {
    const text = await res.text();
    shape = { t: "text", length: text.length };
  }

  return {
    id: ep.id,
    method: init.method,
    path: ep.path,
    status,
    shape,
    ...(arrayLen != null ? { arrayLengthAtCapture: arrayLen } : {}),
  };
}

async function main() {
  mkdirSync(fixturesDir, { recursive: true });

  let token = null;
  const needsAuth = config.endpoints.some((e) => e.auth);
  if (needsAuth) {
    token = await login(config.credentials.email, config.credentials.password);
  }

  const values = { ...config.demoIds };
  let pass = 0;
  let fail = 0;
  const failures = [];

  for (const ep of config.endpoints) {
    try {
      const snap = await captureOne(ep, token, values);
      const file = join(fixturesDir, `${ep.id}.json`);

      if (mode === "capture") {
        writeFileSync(file, JSON.stringify(snap, null, 2) + "\n");
        console.log(`CAPTURED ${ep.id} (HTTP ${snap.status})`);
        pass++;
        continue;
      }

      // verify mode
      if (!existsSync(file)) {
        failures.push(`${ep.id}: no stored fixture. Run with --mode=capture to baseline.`);
        fail++;
        continue;
      }
      const stored = JSON.parse(readFileSync(file, "utf8"));
      const statusDrift = stored.status !== snap.status;
      const diffs = shapeDiff(stored.shape, snap.shape);
      if (statusDrift || diffs.length > 0) {
        const lines = [
          `${ep.id} DRIFT:`,
          statusDrift ? `  status: ${stored.status} -> ${snap.status}` : "",
          ...diffs.map((d) => `  ${d}`),
        ].filter(Boolean);
        failures.push(lines.join("\n"));
        fail++;
      } else {
        pass++;
        console.log(`OK ${ep.id}`);
      }
    } catch (err) {
      failures.push(`${ep.id}: ${err.message}`);
      fail++;
    }
  }

  console.log("");
  console.log(`${mode.toUpperCase()} SUMMARY: ${pass} pass, ${fail} fail`);
  if (fail > 0) {
    console.log("");
    console.log("Failures:");
    for (const f of failures) console.log("  " + f.replace(/\n/g, "\n  "));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(3);
});
