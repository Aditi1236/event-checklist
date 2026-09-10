import {
  getUsersCollection,
  verifyPassword,
  publicUser,
  jsonRes,
  readBody,
  signToken,
  handleOptions,
  AUTHORIZED_ADMIN_EMAILS,
} from "../../_lib/auth.js";

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") {
    return jsonRes(405, { error: "Method not allowed" });
  }

  const body = await readBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password ?? "").trim();

  if (!email || !password) {
    return jsonRes(400, { error: "Email and password are required" });
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ email });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return jsonRes(401, { error: "Invalid email or password" });
  }

  if (user.status === "inactive") {
    return jsonRes(403, { error: "This account has been deactivated" });
  }

  // Restrict admin login to authorized emails only
  if (user.role === "admin" && !AUTHORIZED_ADMIN_EMAILS.includes(email)) {
    return jsonRes(403, { error: "Access denied. This email is not authorized for admin access." });
  }

  return jsonRes(200, { token: signToken(user), user: publicUser(user) });
}
