import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        message: "Database in offline/mock mode",
        seeded: false,
      });
    }

    // Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
    }

    // Seed Programs if empty
    const programCount = await Program.countDocuments();
    if (programCount === 0) {
      await Program.insertMany(INITIAL_PROGRAMS);
    }

    // Seed Blog Posts if empty
    const blogCount = await BlogPost.countDocuments();
    if (blogCount === 0) {
      await BlogPost.insertMany(INITIAL_BLOG_POSTS);
    }

    // Seed Carousel if empty
    const carouselCount = await CarouselSlide.countDocuments();
    if (carouselCount === 0) {
      await CarouselSlide.insertMany(
        INITIAL_CAROUSEL_SLIDES.map((s, idx) => ({ ...s, order: idx }))
      );
    }

    // Seed Demo User if not exists
    const demoUser = await User.findOne({ email: "demo@apex-hockey.com" });
    if (!demoUser) {
      const hashedPassword = await hashPassword("hockey2026");
      await User.create({
        name: "Alex Mercer",
        email: "demo@apex-hockey.com",
        password: hashedPassword,
        role: "vip",
        membershipPlan: "Elite Champion",
        phone: "(+1) 555-0199",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database successfully initialized and seeded with rich hockey data!",
      stats: {
        products: await Product.countDocuments(),
        programs: await Program.countDocuments(),
        blogs: await BlogPost.countDocuments(),
        slides: await CarouselSlide.countDocuments(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
