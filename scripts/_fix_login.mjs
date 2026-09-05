import { connectDB, getUsersCollection, ensureDefaultAdmin, verifyPassword, hashPassword } from "../server/db.js";
const lines = [];
await connectDB();
await ensureDefaultAdmin();
const col = getUsersCollection();
const member = await col.findOne({ email: "member@nexasoul.com" });
const admin = await col.findOne({ email: "admin@nexasoul.com" });
lines.push("member exists: " + !!member);
if (member) {
  lines.push("member.id: " + member.id);
  lines.push("member.role: " + member.role);
  lines.push("member.status: " + member.status);
  lines.push("member.passwordHash present: " + !!member.passwordHash);
  lines.push("member.passwordHash sample: " + String(member.passwordHash).slice(0, 40));
  lines.push("verify member123: " + verifyPassword("member123", member.passwordHash));
  lines.push("verify member123 trimmed: " + verifyPassword(" member123 ".trim(), member.passwordHash));
  lines.push("verify Member123: " + verifyPassword("Member123", member.passwordHash));
  lines.push("verify admin123 on member: " + verifyPassword("admin123", member.passwordHash));
}
lines.push("admin exists: " + !!admin);
if (admin) lines.push("verify admin123: " + verifyPassword("admin123", admin.passwordHash));

// Force-reset member password to a known hash
if (member) {
  const newHash = hashPassword("member123");
  await col.updateOne({ id: member.id }, { $set: { passwordHash: newHash, status: "active", role: "member" } });
  const after = await col.findOne({ id: member.id });
  lines.push("AFTER RESET verify member123: " + verifyPassword("member123", after.passwordHash));
}

// Live HTTP tests against both ports
for (const base of ["http://127.0.0.1:4000", "http://127.0.0.1:5173"]) {
  try {
    const res = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "member@nexasoul.com", password: "member123" }),
    });
    const text = await res.text();
    lines.push(`HTTP ${base} -> ${res.status} ${text.slice(0, 120)}`);
  } catch (e) {
    lines.push(`HTTP ${base} -> FAIL ${e.cause?.code || e.message}`);
  }
}

import fs from "node:fs";
fs.writeFileSync("diag-out.txt", lines.join("\n"));
console.log(lines.join("\n"));
process.exit(0);
