import mongoose from "mongoose";
import { optionalEnv } from "@/lib/env";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

const cached = global.mongooseCache;

/**
 * Returns the shared Mongoose connection, or null when MongoDB is not
 * configured or is unreachable.
 *
 * A failed attempt is NOT cached. The previous version stored the rejected
 * promise, so a single transient failure left the process permanently unable
 * to reconnect and every query silently returned empty results.
 */
export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = optionalEnv("MONGODB_URI");
  if (!uri) {
    console.warn("[mongodb] MONGODB_URI is not set — running without a database.");
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 4000,
      })
      .then((m) => {
        console.log("[mongodb] connected");
        return m;
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[mongodb] connection failed:", message);
        // Clear the cached promise so the next request can try again.
        cached.promise = null;
        cached.conn = null;
        return null;
      });
  }

  const conn = await cached.promise;
  if (conn) {
    cached.conn = conn;
  }
  return conn;
}