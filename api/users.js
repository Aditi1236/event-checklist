import {
  getUsersCollection,
  hashPassword,
  publicUser,
  jsonRes,
  requireAdmin,
  genId,
  handleOptions,
} from "./_lib/auth.js";

const USER_ROLES = ["admin", "member"];

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    const admin = await requireAdmin(req);
    if (!admin) return jsonRes(403, { error: "Admin access required" });

    const users = await getUsersCollection();

    if (req.method === "GET") {
      const all = await users.find({}).sort({ createdAt: -1 }).toArray();
      return jsonRes(200, all.map(publicUser));
    }

    if (req.method === "POST") {
      const body = await req.json();
      const email = String(body.email || "").trim().toLowerCase();
      if (!body.name?.trim() || !email) {
        return jsonRes(400, { error: "Name and email are required" });
      }
      if (!body.password || String(body.password).length < 6) {
        return jsonRes(400, { error: "Password must be at least 6 characters" });
      }
      const dup = await users.findOne({ email });
      if (dup) return jsonRes(409, { error: "An account with this email already exists" });
      const role = USER_ROLES.includes(body.role) ? body.role : "member";
      const newUser = {
        id: body.id || genId("usr"),
        name: String(body.name).trim(),
        email,
        passwordHash: hashPassword(body.password),
        role,
        position: String(body.position || "").trim(),
        phone: String(body.phone || "").trim(),
        status: body.status === "inactive" ? "inactive" : "active",
        createdAt: Date.now(),
      };
      await users.insertOne(newUser);
      return jsonRes(201, publicUser(newUser));
    }

    return jsonRes(405, { error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return jsonRes(500, { error: "Internal server error" });
  }
}
