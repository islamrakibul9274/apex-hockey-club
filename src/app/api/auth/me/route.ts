import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ user: null });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(payload.userId).catch(() => null);

    if (user) {
      return NextResponse.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          membershipPlan: user.membershipPlan,
          address: user.address,
        },
      });
    }

    return NextResponse.json({
      user: {
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        membershipPlan: "Elite Champion",
      },
    });
  } catch {
    return NextResponse.json({
      user: {
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
    });
  }
}
