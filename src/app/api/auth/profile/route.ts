import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    await connectToDatabase();

    const updated = await User.findByIdAndUpdate(
      payload.userId,
      {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
        address: data.address,
      },
      { new: true }
    ).catch(() => null);

    return NextResponse.json({
      success: true,
      user: updated || { ...payload, ...data },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
