import {
  getUsersCollection,
  getEventsCollection,
  hashPassword,
  verifyPassword,
  signToken,
  publicUser,
  jsonRes,
  readBody,
  requireAuth,
  genId,
  handleOptions,
} from "../_lib/auth.js";

const AUTHORIZED_ADMIN_EMAILS = ["ayushnegi.zero@gmail.com", "sumanshujindal76@gmail.com"];
const USER_ROLES = ["admin", "member"];

export default async function handler(req, params) {
  if (req.method === "OPTIONS") return handleOptions();

  // Extract the auth action from the catch-all param
  const slug = params?.slug;
  const action = Array.isArray(slug) ? slug[0] : slug;

  try {
    /* ── /api/auth/login ── */
    if (action === "login" && req.method === "POST") {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password ?? "").trim();
      if (!email || !password) return jsonRes(400, { error: "Email and password are required" });

      const users = await getUsersCollection();
      const user = await users.findOne({ email });
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return jsonRes(401, { error: "Invalid email or password" });
      }
      if (user.status === "inactive") return jsonRes(403, { error: "This account has been deactivated" });
      if (user.role === "admin" && !AUTHORIZED_ADMIN_EMAILS.includes(email)) {
        return jsonRes(403, { error: "Access denied. This email is not authorized for admin access." });
      }
      return jsonRes(200, { token: signToken(user), user: publicUser(user) });
    }

    /* ── /api/auth/signup ── */
    if (action === "signup" && req.method === "POST") {
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
      if (password.length < 6) return jsonRes(400, { error: "Password must be at least 6 characters" });

      const users = await getUsersCollection();
      if (role === "admin") {
        if (!AUTHORIZED_ADMIN_EMAILS.includes(email)) {
          return jsonRes(403, { error: "This email is not authorized to create an admin account." });
        }
        const adminCount = await users.countDocuments({ role: "admin" });
        if (adminCount >= 2) return jsonRes(403, { error: "Maximum of 2 admins allowed." });
      }
      const dup = await users.findOne({ email });
      if (dup) return jsonRes(409, { error: "An account with this email already exists" });

      const newUser = {
        id: genId("usr"), name, email,
        passwordHash: hashPassword(password), role,
        securityQuestion, securityAnswer,
        position: "", phone: "", status: "active", createdAt: Date.now(),
      };
      await users.insertOne(newUser);
      return jsonRes(201, { token: signToken(newUser), user: publicUser(newUser) });
    }

    /* ── /api/auth/get-security-question ── */
    if (action === "get-security-question" && req.method === "POST") {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      if (!email) return jsonRes(400, { error: "Email is required" });
      const users = await getUsersCollection();
      const user = await users.findOne({ email });
      if (!user) return jsonRes(404, { error: "No account found with this email" });
      if (!user.securityQuestion) return jsonRes(400, { error: "This account does not have a security question set up" });
      return jsonRes(200, { question: user.securityQuestion });
    }

    /* ── /api/auth/reset-password ── */
    if (action === "reset-password" && req.method === "POST") {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const answer = String(body.answer || "").trim().toLowerCase();
      const newPassword = String(body.newPassword || "").trim();
      if (!email || !answer || !newPassword) return jsonRes(400, { error: "All fields are required" });
      if (newPassword.length < 6) return jsonRes(400, { error: "Password must be at least 6 characters" });
      const users = await getUsersCollection();
      const user = await users.findOne({ email });
      if (!user) return jsonRes(404, { error: "No account found with this email" });
      if (user.securityAnswer !== answer) return jsonRes(401, { error: "Incorrect answer to security question" });
      await users.updateOne({ id: user.id }, { $set: { passwordHash: hashPassword(newPassword) } });
      return jsonRes(200, { ok: true });
    }

    /* ── /api/auth/me ── */
    if (action === "me" && req.method === "GET") {
      const user = await requireAuth(req);
      if (!user) return jsonRes(401, { error: "Authentication required" });
      return jsonRes(200, publicUser(user));
    }

    /* ── /api/auth/logout ── */
    if (action === "logout" && req.method === "POST") {
      return jsonRes(200, { ok: true });
    }

    return jsonRes(404, { error: "Auth route not found" });
  } catch (err) {
    console.error(err);
    return jsonRes(500, { error: "Internal server error" });
  }
}
