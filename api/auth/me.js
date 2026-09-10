import { requireAuth, publicUser, jsonRes, handleOptions } from "../../_lib/auth.js";

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "GET") {
    return jsonRes(405, { error: "Method not allowed" });
  }

  const user = await requireAuth(req);
  if (!user) {
    return jsonRes(401, { error: "Authentication required" });
  }

  return jsonRes(200, publicUser(user));
}
