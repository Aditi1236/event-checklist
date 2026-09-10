import {
  getUsersCollection,
  hashPassword,
  publicUser,
  jsonRes,
  readBody,
  signToken,
  genId,
  handleOptions,
  AUTHORIZED_ADMIN_EMAILS,
} from "../../_lib/auth.js";

const USER_ROLES = ["admin", "member"];

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") {
    return jsonRes(405, { error: "Method not allowed" });
  }

  const body = await readBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password ?? "").trim();
  const name = String(body.name || "").trim();
  const role = USER_ROLES.includes(body.role) ? body.role : "member";
  const securityQuestion = String(body.securityQuestion || "").trim();
  const securityAnswer = String(body.securityAnswer || "").trim().toLowerCase();

  if (!name || !email || !password || !securityQuestion || !securityAnswer) {
    return jsonRes(400, { error: "Name, email, password, and security question are required" });
  }

  if (password.length < 6) {
    return jsonRes(400, { error: "Password must be at least 6 characters" });
  }

  const users = await getUsersCollection();

  // Restrict admin signup to authorized emails only
  if (role === "admin") {
    if (!AUTHORIZED_ADMIN_EMAILS.includes(email)) {
      return jsonRes(403, {
        error: "This email is not authorized to create an admin account. Admin access is restricted to authorized personnel only.",
      });
    }
    const adminCount = await users.countDocuments({ role: "admin" });
    if (adminCount >= 2) {
      return jsonRes(403, { error: "Maximum of 2 admins allowed." });
    }
  }

  const dup = await users.findOne({ email });
  if (dup) {
    return jsonRes(409, { error: "An account with this email already exists" });
  }

  const newUser = {
    id: genId("usr"),
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    securityQuestion,
    securityAnswer,
    position: "",
    phone: "",
    status: "active",
    createdAt: Date.now(),
  };

  await users.insertOne(newUser);
  return jsonRes(201, { token: signToken(newUser), user: publicUser(newUser) });
}
