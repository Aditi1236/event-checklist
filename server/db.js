import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";
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

export async function connectDB() {
  await client.connect();
  db = client.db(DB_NAME);
  await db.collection("events").createIndex({ id: 1 }, { unique: true });
  await migrateFromJson();
  console.log(`✅ Connected to MongoDB — db: "${DB_NAME}"`);
  return db;
}

export function getEventsCollection() {
  if (!db) throw new Error("Database not connected");
  return db.collection("events");
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
