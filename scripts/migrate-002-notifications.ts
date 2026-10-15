/**
 * Migration 002 — notification preferences on `users`.
 *
 * Adds an optional `preferences` sub-document. Existing users are backfilled
 * with the same defaults the UI shows, so nothing changes behaviourally.
 * Safe to re-run: it only fills in fields that are absent.
 *
 * Run with:  npm run migrate:002
 */
import mongoose from "mongoose";
import fs from "node:fs";
import { connectToDatabase } from "../src/lib/mongodb";

function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    if (fs.existsSync(file)) {
      try {
        process.loadEnvFile(file);
        console.log(`loaded environment from ${file}`);
      } catch {
        // Real environment variables take precedence regardless.
      }
      return;
    }
  }
}

const DEFAULTS = {
  matchAlerts: true,
  trainingReminders: true,
  gearDrops: false,
};

async function main() {
  loadLocalEnv();

  const conn = await connectToDatabase();
  if (!conn) {
    console.error("MONGODB_URI is not set or MongoDB is unreachable. Nothing was changed.");
    process.exitCode = 1;
    return;
  }

  const db = mongoose.connection.db;
  if (!db) {
    console.error("No active database handle. Nothing was changed.");
    process.exitCode = 1;
    return;
  }

  const collection = db.collection("users");

  const backfilled = await collection.updateMany(
    { $or: [{ preferences: { $exists: false } }, { preferences: null }] },
    { $set: { preferences: DEFAULTS } }
  );

  console.log(`002_notifications: backfilled ${backfilled.modifiedCount} document(s)`);
  console.log(`002_notifications: users collection now holds ${await collection.countDocuments()} document(s)`);
  console.log("002_notifications: done");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });