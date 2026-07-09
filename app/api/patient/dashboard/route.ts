import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user as any).role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patientId = (session.user as any).id;

  try {
    const bookings = await prisma.booking.findMany({
      where: { patientId },
      include: {
        clinic: true,
        healthRecord: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const healthRecords = await prisma.healthRecord.findMany({
      where: { patientId },
      include: {
        doctor: { select: { name: true, id: true } },
        booking: { include: { clinic: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ bookings, healthRecords });
  } catch (err) {
    console.error("Patient Dashboard API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
