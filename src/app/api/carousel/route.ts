import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import CarouselSlide from "@/models/CarouselSlide";
import { INITIAL_CAROUSEL_SLIDES } from "@/lib/mockData";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const slides = await CarouselSlide.find().sort({ order: 1 });
      if (slides && slides.length > 0) {
        return NextResponse.json({ success: true, slides, source: "database" });
      }
    }
    return NextResponse.json({ success: true, slides: INITIAL_CAROUSEL_SLIDES, source: "initial" });
  } catch {
    return NextResponse.json({ success: true, slides: INITIAL_CAROUSEL_SLIDES, source: "fallback" });
  }
}
