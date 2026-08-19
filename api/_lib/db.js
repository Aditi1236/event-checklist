import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "eventchecklist";

// Cache the client across serverless invocations (avoid reconnect per request).
let cache = globalThis.__ecMongo;
if (!cache) {
  cache = globalThis.__ecMongo = { client: null, db: null, promise: null };
}

async function connect() {
  if (cache.db) return cache.db;
  if (!cache.promise) {
    const client = new MongoClient(URI, { serverSelectionTimeoutMS: 8000 });
    cache.promise = client
      .connect()
      .then(async () => {
        cache.client = client;
        cache.db = client.db(DB_NAME);
        await cache.db
          .collection("events")
          .createIndex({ id: 1 }, { unique: true });
        return cache.db;
      })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }
  return cache.promise;
}

export async function getEventsCollection() {
  const db = await connect();
  return db.collection("events");
}
