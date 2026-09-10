import { getUsersCollection, hashPassword, jsonRes, readBody, handleOptions } from "../../_lib/auth.js";

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") {
    return jsonRes(405, { error: "Method not allowed" });
  }

  const body = await readBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  const answer = String(body.answer || "").trim().toLowerCase();
  const newPassword = String(body.newPassword || "").trim();

  if (!email || !answer || !newPassword) {
    return jsonRes(400, { error: "All fields are required" });
  }

  if (newPassword.length < 6) {
    return jsonRes(400, { error: "Password must be at least 6 characters" });
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ email });

  if (!user) {
    return jsonRes(404, { error: "No account found with this email" });
  }

  if (user.securityAnswer !== answer) {
    return jsonRes(401, { error: "Incorrect answer to security question" });
  }

  await users.updateOne({ id: user.id }, { $set: { passwordHash: hashPassword(newPassword) } });
  return jsonRes(200, { ok: true });
}
