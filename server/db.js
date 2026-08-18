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
let usingFileStore = false;
let fileCollection = null;

/* ── Persistent JSON-file fallback store ───────────
   Used when MongoDB is unreachable so the app still
   stores and shares data across all users/devices. */
const JSON_PATH = path.join(__dirname, "data", "events.json");

function loadFile() {
  try {
    const raw = fs.readFileSync(JSON_PATH, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveFile(arr) {
  fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(arr, null, 2));
}

function matches(doc, filter = {}) {
  return Object.entries(filter).every(([k, v]) => doc[k] === v);
}

function createFileCollection() {
  let mem = loadFile();
  const persist = () => saveFile(mem);

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
      const event = mem[idx];

      if (update.$push?.tasks) {
        event.tasks = [...(event.tasks || []), update.$push.tasks];
      }
      if (update.$pull?.tasks) {
        const taskId = update.$pull.tasks.id;
        event.tasks = (event.tasks || []).filter((t) => t.id !== taskId);
      }
      if (update.$set) {
        if (update.$set["tasks.$"]) {
          const taskId = filter["tasks.id"];
          const task = (event.tasks || []).find((t) => t.id === taskId);
          if (task) Object.assign(task, update.$set["tasks.$"]);
        } else {
          Object.assign(event, update.$set);
        }
      }
      mem[idx] = event;
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

export async function connectDB() {
  try {
    await client.connect();
    db = client.db(DB_NAME);
    await db.collection("events").createIndex({ id: 1 }, { unique: true });
    await migrateFromJson();
    console.log(`✅ Connected to MongoDB — db: "${DB_NAME}"`);
    return db;
  } catch (err) {
    usingFileStore = true;
    fileCollection = createFileCollection();
    console.warn("⚠️  MongoDB unavailable — using local JSON file store instead.");
    console.warn("    Reason:", err.message);
    console.warn(`    Data is persisted to: ${JSON_PATH}`);
    return null;
  }
}

export function getEventsCollection() {
  if (usingFileStore) return fileCollection;
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
