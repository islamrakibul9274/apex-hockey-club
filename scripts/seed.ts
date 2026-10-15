/**
 * Seeds the catalogue and the demo athlete account.
 *
 * Replaces the old public `GET /api/seed`, which every homepage visit called.
 * Run deliberately instead:
 *
 *   npm run seed
 *
 * Safe to re-run: existing collections are left untouched.
 */
import mongoose from "mongoose";
import fs from "node:fs";
import { connectToDatabase } from "../src/lib/mongodb";
import Product from "../src/models/Product";
import Program from "../src/models/Program";
import BlogPost from "../src/models/BlogPost";
import CarouselSlide from "../src/models/CarouselSlide";
import User from "../src/models/User";
import { hashPassword } from "../src/lib/auth";
import {
  INITIAL_PRODUCTS,
  INITIAL_PROGRAMS,
  INITIAL_BLOG_POSTS,
  INITIAL_CAROUSEL_SLIDES,
} from "../src/lib/mockData";

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

async function main() {
  loadLocalEnv();

  const conn = await connectToDatabase();
  if (!conn) {
    console.error("MONGODB_URI is not set or MongoDB is unreachable. Nothing was written.");
    process.exitCode = 1;
    return;
  }

  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(INITIAL_PRODUCTS);
    console.log(`inserted ${INITIAL_PRODUCTS.length} products`);
  } else {
    console.log("products already present — skipped");
  }

  if ((await Program.countDocuments()) === 0) {
    await Program.insertMany(INITIAL_PROGRAMS);
    console.log(`inserted ${INITIAL_PROGRAMS.length} programmes`);
  } else {
    console.log("programmes already present — skipped");
  }

  if ((await BlogPost.countDocuments()) === 0) {
    await BlogPost.insertMany(INITIAL_BLOG_POSTS);
    console.log(`inserted ${INITIAL_BLOG_POSTS.length} blog posts`);
  } else {
    console.log("blog posts already present — skipped");
  }

  if ((await CarouselSlide.countDocuments()) === 0) {
    await CarouselSlide.insertMany(
      INITIAL_CAROUSEL_SLIDES.map((slide, idx) => ({ ...slide, order: idx }))
    );
    console.log(`inserted ${INITIAL_CAROUSEL_SLIDES.length} carousel slides`);
  } else {
    console.log("carousel slides already present — skipped");
  }

  const demoEmail = "demo@apex-hockey.com";
  const existing = await User.findOne({ email: demoEmail });
  if (!existing) {
    await User.create({
      name: "Alex Mercer",
      email: demoEmail,
      password: await hashPassword("hockey2026"),
      role: "vip",
      membershipPlan: "Elite Champion",
      phone: "+1 555 0199",
    });
    console.log("created demo user demo@apex-hockey.com / hockey2026");
  } else {
    console.log("demo user already present — skipped");
  }

  console.log("seed: done");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });