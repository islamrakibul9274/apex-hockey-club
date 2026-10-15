/**
 * Migration 001 — password reset support on `users`.
 *
 * The change is additive: two optional fields plus one index. No existing
 * document is modified and no data is destroyed, so this is safe to re-run.
 *
 * Run with:  npm run migrate
 */
import mongoose from "mongoose";
import fs from "node:fs";
import { connectToDatabase } from "../src/lib/mongodb";

/**
 * Migrations run outside the Next.js runtime, so .env.local is not loaded
 * automatically. Load it when present so `npm run migrate` works locally.
 */
function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    if (fs.existsSync(file)) {
      try {
        process.loadEnvFile(file);
        console.log(`loaded environment from ${file}`);
      } catch {
        // A malformed file is not fatal; real env vars take precedence anyway.
      }
      return;
    }
  }
}

loadLocalEnv();

async function main() {
  const conn = await connectToDatabase();
  if (!conn) {
    console.error(
      "MONGODB_URI is not set or MongoDB is unreachable. Nothing was changed."
    );
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

  // 1. Ensure the two new fields exist on documents that predate them.
  //    $set on a missing field is a no-op for existing values.
  const backfill = await collection.updateMany(
    {
      $or: [
        { passwordResetHash: { $exists: false } },
        { passwordResetExpires: { $exists: false } },
      ],
    },
    {
      $set: {
        passwordResetHash: null,
        passwordResetExpires: null,
      },
    }
  );

  // 2. Index the reset hash for the lookup in /api/auth/reset-password.
  await collection.createIndex({ passwordResetHash: 1 }, { name: "passwordResetHash_1" });

  // 3. Backfill the index the unique-email rule depends on, if it is missing.
  const indexes = await collection.indexes();
  if (!indexes.some((i) => i.name === "email_1")) {
    await collection.createIndex({ email: 1 }, { name: "email_1", unique: true });
    console.log("created unique index on email");
  } else {
    console.log("unique index on email already present");
  }

  const total = await collection.countDocuments();
  console.log(`001_password_reset: backfilled ${backfill.modifiedCount} document(s)`);
  console.log(`001_password_reset: users collection now holds ${total} document(s)`);
  console.log("001_password_reset: done");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });