import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { INITIAL_PRODUCTS } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const conn = await connectToDatabase();
    if (conn) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter: any = {};
      if (category && category !== "All") {
        filter.category = category;
      }
      if (search) {
        filter.title = { $regex: search, $options: "i" };
      }

      const products = await Product.find(filter).sort({ createdAt: -1 });
      if (products && products.length > 0) {
        return NextResponse.json({ success: true, products, source: "database" });
      }
    }

    // Fallback to initial products
    let filtered = INITIAL_PRODUCTS;
    if (category && category !== "All") {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ success: true, products: filtered, source: "initial" });
  } catch {
    return NextResponse.json({ success: true, products: INITIAL_PRODUCTS, source: "fallback" });
  }
}
