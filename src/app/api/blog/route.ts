import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { INITIAL_BLOG_POSTS } from "@/lib/mockData";
import { withIdAll } from "@/lib/serialise";
import { withErrorHandling } from "@/lib/api";

/**
 * GET /api/blog
 *
 * The blog index previously filtered a hard-coded array and never touched the
 * database, so posts added through the CMS were invisible.
 */
export async function GET() {
  return withErrorHandling("blog/list", async () => {
    const conn = await connectToDatabase();

    if (conn) {
      const posts = await BlogPost.find().sort({ publishedAt: -1 }).catch(() => null);

      if (posts && posts.length > 0) {
        return NextResponse.json({ success: true, posts: withIdAll(posts), source: "database" });
      }
    }

    return NextResponse.json({ success: true, posts: INITIAL_BLOG_POSTS, source: "catalogue" });
  });
}