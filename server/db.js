import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Minimal .env loader (no external dependency) ──
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "eventchecklist";

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });

let db;
let usingFileStore = false;
let fileCollection = null;

/* ── Persistent JSON-file fallback store ───────────
   Used when MongoDB is unreachable so the app still
   stores and shares data across all users/devices. */
function getJsonPath(collectionName) {
  return path.join(__dirname, "data", `${collectionName}.json`);
}

function loadFile(collectionName) {
  try {
    const raw = fs.readFileSync(getJsonPath(collectionName), "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveFile(collectionName, arr) {
  const jsonPath = getJsonPath(collectionName);
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(arr, null, 2));
}

function matches(doc, filter = {}) {
  return Object.entries(filter).every(([k, v]) => doc[k] === v);
}

function createFileCollection(collectionName) {
  let mem = loadFile(collectionName);
  const persist = () => saveFile(collectionName, mem);

  return {
    async find(filter = {}) {
      const arr = mem.filter((e) => matches(e, filter));
      return {
        sort(spec = {}) {
          const [key, dir = -1] = Object.entries(spec)[0] || ["createdAt", -1];
          const sorted = [...arr].sort((a, b) => {
            if (a[key] < b[key]) return dir === 1 ? -1 : 1;
            if (a[key] > b[key]) return dir === 1 ? 1 : -1;
            return 0;
          });
          return { toArray: async () => sorted };
        },
        toArray: async () => [...arr],
      };
    },
    async findOne(filter = {}) {
      return mem.find((e) => matches(e, filter)) || null;
    },
    async insertOne(doc) {
      mem.push(doc);
      persist();
      return { insertedId: doc.id };
    },
    async insertMany(docs = []) {
      mem.push(...docs);
      persist();
      return { insertedCount: docs.length };
    },
    async updateOne(filter, update = {}) {
      const idx = mem.findIndex((e) => e.id === filter.id);
      if (idx === -1) return { matchedCount: 0 };
      const doc = mem[idx];

      if (update.$push?.tasks) {
        doc.tasks = [...(doc.tasks || []), update.$push.tasks];
      }
      if (update.$pull?.tasks) {
        const taskId = update.$pull.tasks.id;
        doc.tasks = (doc.tasks || []).filter((t) => t.id !== taskId);
      }
      if (update.$set) {
        if (update.$set["tasks.$"]) {
          const taskId = filter["tasks.id"];
          const task = (doc.tasks || []).find((t) => t.id === taskId);
          if (task) Object.assign(task, update.$set["tasks.$"]);
        } else {
          Object.assign(doc, update.$set);
        }
      }
      mem[idx] = doc;
      persist();
      return { matchedCount: 1 };
    },
    async deleteOne(filter = {}) {
      const before = mem.length;
      mem = mem.filter((e) => !matches(e, filter));
      persist();
      return { deletedCount: before - mem.length };
    },
    async countDocuments(filter = {}) {
      return mem.filter((e) => matches(e, filter)).length;
    },
    async createIndex() {
      return null;
    },
  };
}

let eventsFileCollection = null;
let usersFileCollection = null;

export async function connectDB() {
  try {
    await client.connect();
    db = client.db(DB_NAME);
    await db.collection("events").createIndex({ id: 1 }, { unique: true });
    await db.collection("users").createIndex({ id: 1 }, { unique: true });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await migrateFromJson();
    console.log(`✅ Connected to MongoDB — db: "${DB_NAME}"`);
    return db;
  } catch (err) {
    usingFileStore = true;
    eventsFileCollection = createFileCollection("events");
    usersFileCollection = createFileCollection("users");
    console.warn("⚠️  MongoDB unavailable — using local JSON file store instead.");
    console.warn("    Reason:", err.message);
    return null;
  }
}

export function getEventsCollection() {
  if (usingFileStore) return eventsFileCollection;
  if (!db) throw new Error("Database not connected");
  return db.collection("events");
}

export function getUsersCollection() {
  if (usingFileStore) return usersFileCollection;
  if (!db) throw new Error("Database not connected");
  return db.collection("users");
}

/* ── Password hashing (pbkdf2, no external deps) ──── */
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

/* ── Default accounts ─────────────────────────────────
   Seeded on first boot (works for MongoDB AND the
   JSON-file fallback):
     • Member:   member@nexasoul.com / member123
   Admin accounts are NOT auto-seeded — they must be created
   through the Admin Sign Up page using authorized emails:
     • ayushnegi.zero@gmail.com
     • sumanshujindal76@gmail.com
   Members created later by the Admin use their own
   credentials from the Admin Dashboard → Members tab. */

// Authorized admin emails (must match the list in server/index.js)
const AUTHORIZED_ADMIN_EMAILS = [
  "ayushnegi.zero@gmail.com",
  "sumanshujindal76@gmail.com",
];

export async function ensureDefaultAdmin() {
  const users = getUsersCollection();
  
  // Note: Admin accounts are NOT auto-seeded.
  // They must be created through the Admin Sign Up page.
  // This ensures the admins set up their own passwords.

  // Clean up any existing admin accounts from previous versions
  // (This allows the authorized admins to sign up fresh)
  const existingAdmins = await users.find({ role: "admin" }).toArray();
  if (existingAdmins.length > 0) {
    await users.deleteMany({ role: "admin" });
    console.log(`??? Removed ${existingAdmins.length} existing admin account(s) - admins must sign up via Admin Sign Up page`);
  }

  
  // Seed demo executive member so the Member portal can be tried instantly.
  const demoMember = await users.findOne({ email: "member@nexasoul.com" });
  if (!demoMember) {
    try {
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
      console.log(`🔐 Seeded demo member —  member@nexasoul.com / member123`);
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  }

  return null;
}

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

// One-time import of the old JSON store into MongoDB (only if empty)
async function migrateFromJson() {
  const jsonPath = path.join(__dirname, "data", "events.json");
  if (!fs.existsSync(jsonPath)) return;
  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch {
    return;
  }
  if (!Array.isArray(existing) || existing.length === 0) return;

  const col = db.collection("events");
  const count = await col.countDocuments();
  if (count > 0) return;

  await col.insertMany(existing);
  console.log(`📥 Migrated ${existing.length} event(s) from events.json into MongoDB`);
}
