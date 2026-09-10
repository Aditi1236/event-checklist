import {
  getUsersCollection,
  hashPassword,
  publicUser,
  jsonRes,
  requireAdmin,
  handleOptions,
} from "../_lib/auth.js";

const USER_ROLES = ["admin", "member"];

export default async function handler(req, params) {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    const adminUser = await requireAdmin(req);
    if (!adminUser) return jsonRes(403, { error: "Admin access required" });

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const userId = params?.id || decodeURIComponent(pathParts[2] || "");
    const users = await getUsersCollection();

    if (req.method === "PUT") {
      const existing = await users.findOne({ id: userId });
      if (!existing) return jsonRes(404, { error: "User not found" });
      const body = await req.json();
      const patch = {
        name: body.name !== undefined ? String(body.name).trim() : existing.name,
        email: body.email !== undefined ? String(body.email).trim().toLowerCase() : existing.email,
        role: body.role !== undefined && USER_ROLES.includes(body.role) ? body.role : existing.role,
        position: body.position !== undefined ? String(body.position).trim() : existing.position,
        phone: body.phone !== undefined ? String(body.phone).trim() : existing.phone,
        status: body.status !== undefined ? body.status : existing.status,
      };
      if (patch.email && patch.email !== existing.email) {
        const dup = await users.findOne({ email: patch.email });
        if (dup) return jsonRes(409, { error: "Another account already uses this email" });
      }
      if (existing.role === "admin" && (patch.role !== "admin" || patch.status === "inactive")) {
        const otherAdmins = await users.countDocuments({ role: "admin", status: "active" });
        if (existing.id === adminUser.id && otherAdmins <= 1) {
          return jsonRes(400, { error: "You cannot demote or deactivate your own account" });
        }
      }
      if (body.newPassword && String(body.newPassword).length >= 6) {
        patch.passwordHash = hashPassword(body.newPassword);
      }
      await users.updateOne({ id: userId }, { $set: patch });
      const updated = await users.findOne({ id: userId });
      return jsonRes(200, publicUser(updated));
    }

    if (req.method === "DELETE") {
      const existing = await users.findOne({ id: userId });
      if (!existing) return jsonRes(404, { error: "User not found" });
      if (existing.id === adminUser.id) return jsonRes(400, { error: "You cannot delete your own account" });
      if (existing.role === "admin") {
        const admins = await users.countDocuments({ role: "admin" });
        if (admins <= 1) return jsonRes(400, { error: "Cannot delete the last admin account" });
      }
      await users.deleteOne({ id: userId });
      return jsonRes(200, { ok: true });
    }

    return jsonRes(405, { error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return jsonRes(500, { error: "Internal server error" });
  }
}
