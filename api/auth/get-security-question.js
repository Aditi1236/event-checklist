import { getUsersCollection, jsonRes, readBody, handleOptions } from "../../_lib/auth.js";

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") {
    return jsonRes(405, { error: "Method not allowed" });
  }

  const body = await readBody(req);
  const email = String(body.email || "").trim().toLowerCase();

  if (!email) {
    return jsonRes(400, { error: "Email is required" });
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ email });

  if (!user) {
    return jsonRes(404, { error: "No account found with this email" });
  }

  if (!user.securityQuestion) {
    return jsonRes(400, { error: "This account does not have a security question set up" });
  }

  return jsonRes(200, { question: user.securityQuestion });
}
