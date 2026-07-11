import http from "k6/http";
import { check } from "k6";

// This models the "everyone hits book-now the instant slots open" scenario —
// a fast ramp-up to a high concurrent user count, held for a bit, then a
// ramp-down. Deliberately steep at the start, since that's what triggers
// HPA visibly.
//
// IMPORTANT: this hits /api/slots, not the homepage. The homepage in
// Next.js standalone mode is nearly free to serve (static/prerendered),
// so it never generates enough CPU load to trigger scaling — the first
// test run confirmed this (0% CPU, p95 2.71ms, HPA never moved).
// /api/slots is a real Prisma-backed route: it queries Neon over the
// network, computes slot availability, and actually costs CPU + I/O time
// per request — a realistic stand-in for "check available booking slots,"
// the actual rush scenario this project is modeling.
export const options = {
  stages: [
    { duration: "20s", target: 50 },   // slots just opened — fast ramp
    { duration: "40s", target: 150 },  // sustained rush
    { duration: "40s", target: 150 },  // hold — this is where HPA should react
    { duration: "20s", target: 0 },    // rush subsides
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<8000"],
  },
};

const BASE_URL = "http://localhost:3000";

// Real seeded clinic from scripts/seed-credentials.js — the /api/slots
// route accepts a clinic *name* as a fallback for clinicId.
const CLINIC_NAME = encodeURIComponent("MedPlus Healthcare Centre - Yeshwanthpur");
const TODAY = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

export default function () {
  const res = http.get(
    `${BASE_URL}/api/slots?clinicId=${CLINIC_NAME}&date=${TODAY}`
  );
  check(res, {
    "status is 200 or 404": (r) => r.status === 200 || r.status === 404,
  });
  // No sleep() here deliberately — each VU fires requests back-to-back to
  // maximize real concurrent load per virtual user, rather than mostly
  // idling like the first test did.
}
