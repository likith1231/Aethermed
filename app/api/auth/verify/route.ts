import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Missing credentials" },
        { status: 400 }
      );
    }

    console.log("Login attempt:", { email, password, role });
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    console.log("User found:", user);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Access Denied: Unauthorized Personnel." },
        { status: 401 }
      );
    }

    // Role and password check
    if (user.password === password && user.role === role) {
      return NextResponse.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
    }

    return NextResponse.json(
      { success: false, message: "Access Denied: Unauthorized Personnel." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth Verify Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
