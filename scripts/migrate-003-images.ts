/**
 * Migration 003 — point stored records at the new WebP photography.
 *
 * The catalogue was seeded with `/images/1.png`-style paths. Those PNGs have
 * been replaced with role-based WebP crops (`/images/hero-action-wide.webp`),
 * so every stored record was 404ing — which rendered the hero as a black box.
 *
 * Matches database rows to the seed catalogue by title (carousel by order, as
 * it has no unique title) and rewrites the image field. Safe to re-run.
 *
 * Run with:  npm run migrate:003
 */
import mongoose from "mongoose";
import fs from "node:fs";
import { connectToDatabase } from "../src/lib/mongodb";
import CarouselSlide from "../src/models/CarouselSlide";
import Product from "../src/models/Product";
import Program from "../src/models/Program";
import BlogPost from "../src/models/BlogPost";
import {
  INITIAL_CAROUSEL_SLIDES,
  INITIAL_PRODUCTS,
  INITIAL_PROGRAMS,
  INITIAL_BLOG_POSTS,
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
    console.error("MONGODB_URI is not set or MongoDB is unreachable. Nothing was changed.");
    process.exitCode = 1;
    return;
  }

  // Slides have no unique title, so they are remapped by sort order.
  const slides = await CarouselSlide.find().sort({ order: 1 });
  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index];
    const next = INITIAL_CAROUSEL_SLIDES[index];
    if (!next) continue;
    if (slide.image !== next.image) {
      await CarouselSlide.updateOne({ _id: slide._id }, { $set: { image: next.image } });
      console.log(`  carousel[${index}] ${slide.image} -> ${next.image}`);
    }
  }

  const byTitle = async <T extends { title: string; image: string }>(
    Model: mongoose.Model<any>,
    seed: T[],
    label: string
  ) => {
    for (const entry of seed) {
      await Model.updateMany(
        { title: entry.title, image: { $ne: entry.image } },
        { $set: { image: entry.image } }
      );
      const remaining = await Model.countDocuments({ title: entry.title });
      console.log(`  ${label} "${entry.title}" -> ${entry.image} (${remaining} row(s))`);
    }
  };

  await byTitle(Product, INITIAL_PRODUCTS, "product ");
  await byTitle(Program, INITIAL_PROGRAMS, "program ");
  await byTitle(BlogPost, INITIAL_BLOG_POSTS, "blog    ");

  // Anything still pointing at the old PNGs is a record with no seed match.
  const stale = await Promise.all(
    [CarouselSlide, Product, Program, BlogPost].map((M) =>
      M.countDocuments({ image: /^\/images\/(?:\d|Group)/ })
    )
  );
  const totalStale = stale.reduce((a, b) => a + b, 0);

  console.log(`003_images: ${totalStale} record(s) still referencing removed PNGs`);
  console.log("003_images: done");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });