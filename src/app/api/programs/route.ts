import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Program from "@/models/Program";
import { INITIAL_PROGRAMS } from "@/lib/mockData";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const programs = await Program.find().sort({ createdAt: 1 });
      if (programs && programs.length > 0) {
        return NextResponse.json({ success: true, programs, source: "database" });
      }
    }
    return NextResponse.json({ success: true, programs: INITIAL_PROGRAMS, source: "initial" });
  } catch {
    return NextResponse.json({ success: true, programs: INITIAL_PROGRAMS, source: "fallback" });
  }
}
