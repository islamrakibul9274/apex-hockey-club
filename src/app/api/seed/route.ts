import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import Program from "@/models/Program";
import BlogPost from "@/models/BlogPost";
import CarouselSlide from "@/models/CarouselSlide";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import {
  INITIAL_PRODUCTS,
  INITIAL_PROGRAMS,
  INITIAL_BLOG_POSTS,
  INITIAL_CAROUSEL_SLIDES,
} from "@/lib/mockData";
import { withErrorHandling, forbidden, serverError } from "@/lib/api";

/**
 * POST /api/seed
 *
 * This was `GET /api/seed` with no authentication, and the homepage called it
 * on every visit. A GET that mutates state can be triggered by a crawler, by
 * link prefetch, or cross-site, and it created a user with published
 * credentials.
 *
 * It is now a POST that requires a shared secret sent as
 * `x-seed-secret`, matching SEED_SECRET. With the secret unset the endpoint
 * refuses outright rather than defaulting to open.
 */
export async function POST(req: NextRequest) {
  return withErrorHandling("seed", async () => {
    const expected = process.env.SEED_SECRET;
    const provided = req.headers.get("x-seed-secret");

    if (!expected || provided !== expected) {
      // Never reveal whether the endpoint is merely locked or not configured.
      return forbidden("Seeding is not available");
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return serverError("Database is unreachable. Nothing was written.");
    }

    // Seed Products if empty
    if ((await Product.countDocuments()) === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
    }

    // Seed Programs if empty
    if ((await Program.countDocuments()) === 0) {
      await Program.insertMany(INITIAL_PROGRAMS);
    }

    // Seed Blog Posts if empty
    if ((await BlogPost.countDocuments()) === 0) {
      await BlogPost.insertMany(INITIAL_BLOG_POSTS);
    }

    // Seed Carousel if empty
    if ((await CarouselSlide.countDocuments()) === 0) {
      await CarouselSlide.insertMany(INITIAL_CAROUSEL_SLIDES.map((s, idx) => ({ ...s, order: idx })));
    }

    return NextResponse.json({
      success: true,
      message: "Catalogue seeded.",
      stats: {
        products: await Product.countDocuments(),
        programs: await Program.countDocuments(),
        blogs: await BlogPost.countDocuments(),
        slides: await CarouselSlide.countDocuments(),
      },
    });
  });
}

/**
 * POST /api/seed/demo-user
 *
 * Creates the demo athlete account on demand. Kept separate from catalogue
 * seeding and behind the same secret, so no public endpoint can provision a
 * privileged account.
 */
export async function PUT(req: NextRequest) {
  return withErrorHandling("seed/demo-user", async () => {
    const expected = process.env.SEED_SECRET;
    if (!expected || req.headers.get("x-seed-secret") !== expected) {
      return forbidden("Seeding is not available");
    }

    const conn = await connectToDatabase();
    if (!conn) return serverError("Database is unreachable. Nothing was written.");

    const existing = await User.findOne({ email: "demo@apex-hockey.com" });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Demo user already exists.",
        created: false,
      });
    }

    await User.create({
      name: "Alex Mercer",
      email: "demo@apex-hockey.com",
      password: await hashPassword("hockey2026"),
      role: "vip",
      membershipPlan: "Elite Champion",
      phone: "+1 555 0199",
    });

    return NextResponse.json({ success: true, created: true });
  });
}