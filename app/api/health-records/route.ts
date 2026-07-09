import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "doctor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorId = (session.user as any).id;
    const body = await request.json();
    const { patientId, bookingId, diagnosis, prescription, notes } = body;

    if (!patientId || !bookingId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const healthRecord = await prisma.healthRecord.create({
      data: {
        patientId,
        doctorId,
        bookingId,
        diagnosis,
        prescription,
        notes,
      },
    });

    return NextResponse.json(healthRecord, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create health record:", err);
    // Handle unique constraint violation on bookingId if it already has a record
    if (err.code === 'P2002') {
      return NextResponse.json({ error: "A health record already exists for this booking." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || ((session.user as any).role !== "doctor" && (session.user as any).role !== "patient")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
    }

    // Both doctors and patients can fetch records (patient can only fetch their own)
    if ((session.user as any).role === "patient" && (session.user as any).id !== patientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const healthRecords = await prisma.healthRecord.findMany({
      where: { patientId },
      include: {
        doctor: { select: { name: true, id: true } },
        booking: { include: { clinic: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(healthRecords);
  } catch (err) {
    console.error("Failed to fetch health records:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
