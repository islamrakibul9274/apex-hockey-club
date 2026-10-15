import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { INITIAL_PRODUCTS } from "@/lib/mockData";
import { withErrorHandling } from "@/lib/api";
import { escapeRegex, normaliseTerm } from "@/lib/text";
import { normaliseCatalogue, withId } from "@/lib/serialise";

/**
 * Reads request headers, cookies or body, so it can never be statically
 * rendered. Declared explicitly because withErrorHandling catches thrown
 * errors, and swallowing Next's DynamicServerError would otherwise let
 * the route be cached as a static shell.
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return withErrorHandling("products/list", async () => {
    const { searchParams } = new URL(req.url);
    const category = normaliseTerm(searchParams.get("category"), 60);
    const search = normaliseTerm(searchParams.get("search"));

    const conn = await connectToDatabase();

    if (conn) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter: Record<string, any> = {};
      if (category && category !== "All") {
        filter.category = category;
      }
      if (search) {
        filter.title = { $regex: escapeRegex(search), $options: "i" };
      }

      const products = await Product.find(filter).sort({ createdAt: -1 }).catch(() => null);

      if (products && products.length > 0) {
        // Documents from MongoDB have no `id`; without this the client keyed
        // carts, likes and checkout on `undefined`.
        return NextResponse.json({
          success: true,
          products: normaliseCatalogue(products, INITIAL_PRODUCTS),
          source: "database",
        });
      }

      // A filter that legitimately matches nothing should return an empty
      // list, not silently fall back to the unfiltered catalogue. Falling back
      // previously meant a zero-result search still showed every product.
      if (products && products.length === 0 && (category || search)) {
        return NextResponse.json({ success: true, products: [], source: "database" });
      }
    }

    // Catalogue seed, filtered identically so both paths agree.
    let filtered = INITIAL_PRODUCTS;
    if (category && category !== "All") {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search) {
      const needle = search.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(needle));
    }

    return NextResponse.json({
      success: true,
      products: filtered.map((p, i) => withId(p, `item-${i}`)),
      source: "catalogue",
    });
  });
}