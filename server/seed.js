import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB, getEventsCollection } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ──────────────────────────────────────────────────────
   Seed runner — reads events from events.json and syncs
   them into MongoDB (skips duplicates by name).
   Works with both MongoDB and JSON-file fallback.
   ────────────────────────────────────────────────────── */
async function seed() {
  // Read events from events.json
  const jsonPath = path.join(__dirname, "data", "events.json");
  let events = [];
  try {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    events = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read ${jsonPath}:`, err.message);
    process.exit(1);
  }

  if (!Array.isArray(events) || events.length === 0) {
    console.log("No events found in events.json");
    return;
  }

  await connectDB();
  const collection = getEventsCollection();

  // Check for existing events by name to avoid duplicates
  const existing = await collection.find({}).toArray();
  const existingNames = new Set(existing.map((e) => e.name));

  const newEvents = events.filter((e) => !existingNames.has(e.name));

  if (newEvents.length === 0) {
    console.log("All events already exist in the database.");
    console.log(`Total events in store: ${existing.length}`);
    return;
  }

  await collection.insertMany(newEvents);
  console.log(`Successfully seeded ${newEvents.length} events:`);
  newEvents.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.name} [${e.type} - ${e.category}]`);
  });
  console.log(`Total events in store: ${existing.length + newEvents.length}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});