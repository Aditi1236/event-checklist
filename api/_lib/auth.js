import { MongoClient } from "mongodb";
import crypto from "node:crypto";

/* ── MongoDB connection (cached across serverless invocations) ── */
const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "eventchecklist";

let cache = globalThis.__ecMongoAuth;
if (!cache) {
  cache = globalThis.__ecMongoAuth = { client: null, db: null, promise: null };
}

export async function getDb() {
  if (cache.db) return cache.db;
  if (!cache.promise) {
    const client = new MongoClient(URI, { serverSelectionTimeoutMS: 8000 });
    cache.promise = client.connect().then(async () => {
      cache.client = client;
      cache.db = client.db(DB_NAME);
      await cache.db.collection("users").createIndex({ email: 1 }, { unique: true });
      await ensureDefaultAccounts(cache.db);
      return cache.db;
    }).catch((err) => {
      cache.promise = null;
      throw err;
    });
  }
  return cache.promise;
}

export async function getUsersCollection() {
  const db = await getDb();
  return db.collection("users");
}

/* ── Config ── */
const AUTH_SECRET = process.env.AUTH_SECRET || "nexasoul-dev-secret-change-me";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const USER_ROLES = ["admin", "member"];

// ONLY these two email addresses are authorized to access the Admin Portal
const AUTHORIZED_ADMIN_EMAILS = [
  "ayushnegi.zero@gmail.com",
  "sumanshujindal76@gmail.com",
];

/* ── Password hashing (pbkdf2) ── */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(String(password), salt, 12000, 64, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored = "") {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const calc = crypto.pbkdf2Sync(String(password), salt, 12000, 64, "sha256").toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(calc, "hex"));
  } catch {
    return false;
  }
}

/* ── JWT-like token signing ── */
function signToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + TOKEN_TTL_MS,
    })
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  const [payload, sig] = String(token || "").split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!claims.sub || Date.now() > claims.exp) return null;
    return claims;
  } catch {
    return null;
  }
}

/* ── Public user (strip sensitive fields) ── */
export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    position: user.position,
    phone: user.phone,
    status: user.status,
    createdAt: user.createdAt,
  };
}

/* ── Auth helpers ── */
async function getUserFromReq(req) {
  const auth = req.headers.get?.("authorization") || req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  const claims = verifyToken(token);
  if (!claims) return null;
  const users = await getUsersCollection();
  const user = await users.findOne({ id: claims.sub });
  if (!user || user.status === "inactive") return null;
  return user;
}

export async function requireAuth(req) {
  const user = await getUserFromReq(req);
  return user; // null if not authenticated
}

export async function requireAdmin(req) {
  const user = await getUserFromReq(req);
  if (!user || user.role !== "admin") return null;
  return user;
}

/* ── Response helpers ── */
export function jsonRes(status, body) {
  return new Response(body !== undefined ? JSON.stringify(body) : "", {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function readBody(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Seed default demo accounts on first boot ── */
async function ensureDefaultAccounts(db) {
  const users = db.collection("users");

  // Seed demo executive member so the Member portal can be tried instantly
  const demoMember = await users.findOne({ email: "member@nexasoul.com" });
  if (!demoMember) {
    await users.insertOne({
      id: `usr_member_${Math.random().toString(36).slice(2, 8)}`,
      name: "Demo Member",
      email: "member@nexasoul.com",
      passwordHash: hashPassword("member123"),
      role: "member",
      position: "Executive Member",
      phone: "",
      status: "active",
      createdAt: Date.now(),
    });
  }
}

export { signToken, genId, AUTHORIZED_ADMIN_EMAILS };
