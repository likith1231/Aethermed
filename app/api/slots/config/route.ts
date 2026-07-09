import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clinicId, startTime, endTime, slotDuration, maxPerSlot } = await request.json();

    if (!clinicId) {
      return NextResponse.json({ error: "Clinic ID is required" }, { status: 400 });
    }

    const config = await prisma.slotConfig.upsert({
      where: { clinicId },
      update: {
        startTime,
        endTime,
        slotDuration: parseInt(slotDuration, 10),
        maxPerSlot: parseInt(maxPerSlot, 10)
      },
      create: {
        clinicId,
        startTime,
        endTime,
        slotDuration: parseInt(slotDuration, 10),
        maxPerSlot: parseInt(maxPerSlot, 10)
      }
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Failed to update slot config:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
