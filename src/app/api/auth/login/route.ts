import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { comparePassword, signJwt } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, isDemo } = await req.json();

    // 1-Click Demo Login
    if (isDemo || email === "demo@apex-hockey.com") {
      const demoUser = {
        id: "demo-user-123",
        name: "Alex Mercer",
        email: "demo@apex-hockey.com",
        role: "vip",
        membershipPlan: "Elite Champion",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      };

      const token = signJwt({
        userId: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
      });

      const response = NextResponse.json({
        success: true,
        user: demoUser,
      });

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Please provide both email and password" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase().trim() }).catch(() => null);

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.password) {
      const match = await comparePassword(password, user.password);
      if (!match) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
    }

    const token = signJwt({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        membershipPlan: user.membershipPlan,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Authentication error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
