import { jsonRes, handleOptions } from "../../_lib/auth.js";

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") {
    return jsonRes(405, { error: "Method not allowed" });
  }
  // Stateless JWT — logout is handled client-side by removing the token.
  return jsonRes(200, { ok: true });
}
