import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clinicFilter = searchParams.get('clinicName');
  const clinicId = searchParams.get('clinicId');
  const dateStr = searchParams.get('date');
  
  try {
    const whereClause: any = {};
    if (clinicId) {
      whereClause.clinicId = clinicId;
    } else if (clinicFilter) {
      whereClause.clinic = { name: clinicFilter };
    }
    
    if (dateStr) {
      whereClause.timeInput = { startsWith: dateStr };
    }
    
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {

        clinic: true,
        patient: true,
        assignedStaff: true
      },
      orderBy: {
        userToken: 'asc'
      }
    });
    
    // Map to the existing frontend structure to prevent breaking UI
    const formattedBookings = bookings.map(b => ({
      id: b.id,
      clinicName: b.clinic.name,
      patientName: b.patientName,
      email: b.email,
      phone: b.phone,
      userToken: b.userToken,
      timeInput: b.timeInput,
      status: b.status,
      assignedPersonnel: b.assignedStaff?.name || "Delegate to...",
      consultFee: b.consultFee || 0,
      diagFee: b.diagFee || 0,
      pharmacyFee: b.pharmacyFee || 0,
      isTelemedicine: b.isTelemedicine,
      telemedicineLink: b.telemedicineLink,
      service: "General Consultation",
      date: b.timeInput.split(' ')[0] || b.timeInput,
      patientId: b.patientId
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error("GET Bookings Error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ensure clinic exists
    const clinic = await prisma.clinic.upsert({
      where: { name: body.clinicName },
      update: {},
      create: { name: body.clinicName }
    });

    const email = body.email || "guest@email.com";
    const patientName = body.patientName || "Anonymous Guest";

    // Ensure patient (User) exists
    const patient = await prisma.user.upsert({
      where: { email },
      update: { name: patientName },
      create: { email, name: patientName, role: "patient" }
    });

    // Calculate next token
    const dateStr = body.timeInput.split(' ')[0];
    const clinicBookingsCount = await prisma.booking.count({
      where: { 
        clinicId: clinic.id,
        timeInput: { startsWith: dateStr }
      }
    });
    const nextTokenNumber = clinicBookingsCount + 1;

    const newBooking = await prisma.booking.create({
      data: {
        clinicId: clinic.id,
        patientId: patient.id,
        patientName: patientName,
        email: email,
        phone: body.phone,
        timeInput: body.timeInput,
        userToken: nextTokenNumber,
        status: "Pending",
        isTelemedicine: body.isTelemedicine || false,
        telemedicineLink: body.isTelemedicine ? `https://meet.jit.si/AetherMed-${clinic.id.slice(-4)}-${Date.now()}` : null
      },
      include: {
        clinic: true,
        patient: true
      }
    });



    return NextResponse.json({ 
      success: true, 
      booking: {
        id: newBooking.id,
        clinicName: newBooking.clinic.name,
        patientName: newBooking.patientName,
        userToken: newBooking.userToken,
        status: newBooking.status
      } 
    }, { status: 201 });
  } catch (error) {
    console.error("POST Booking Error:", error);
    return NextResponse.json({ success: false, error: "Submission failed" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, assignedStaff, diagnosis, prescription, notes, doctorId } = await request.json();
    
    const updateData: any = {};
    if (status) updateData.status = status;
    
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }
    
    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: { clinic: true }
    });



    if (status === "Processed" && (diagnosis || prescription || notes)) {
      await prisma.healthRecord.upsert({
        where: { bookingId: id },
        update: {
          diagnosis,
          prescription: typeof prescription === 'string' ? prescription : JSON.stringify(prescription),
          notes,
          doctorId,
        },
        create: {
          patientId: booking.patientId,
          bookingId: id,
          diagnosis,
          prescription: typeof prescription === 'string' ? prescription : JSON.stringify(prescription),
          notes,
          doctorId,
        }
      });
    }
      
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("PATCH Booking Error:", error);
    return NextResponse.json({ success: false, error: "Mutation Pipeline Failed" }, { status: 500 });
  }
}

