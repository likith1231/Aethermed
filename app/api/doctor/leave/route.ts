import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { doctorId, clinicName, date, startTime, endTime, reason } = body;

    if (!doctorId || !clinicName || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const clinic = await prisma.clinic.findUnique({ where: { name: clinicName } });
    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }
    const clinicId = clinic.id;

    // Create the leave record
    const leave = await prisma.doctorLeave.create({
      data: {
        doctorId,
        clinicId,
        date,
        startTime: startTime || null,
        endTime: endTime || null,
        reason
      }
    });

    // Find affected bookings
    // A booking is affected if its date matches (from timeInput e.g., "YYYY-MM-DD HH:mm AM/PM" or date field)
    // and if the time overlaps. For simplicity, since the booking timeInput format varies,
    // we fetch all bookings for the clinic on that date and check time manually.
    const allBookings = await prisma.booking.findMany({
      where: {
        clinicId,
        status: { in: ["Pending", "Confirmed"] }
      }
    });

    const affectedBookings = allBookings.filter(b => {
      const bDate = b.timeInput.split(' ')[0]; // Assuming format "2023-10-15 10:00 AM" or similar
      if (bDate !== date) return false;

      if (!startTime || !endTime) return true; // Full day leave affects all bookings on that day

      // Parse booking time
      const timeMatch = b.timeInput.match(/\s+(\d+):(\d+)\s*(AM|PM)?/i);
      if (!timeMatch) return false;

      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3]?.toUpperCase();

      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;

      const bookingMins = h * 60 + m;

      // Parse leave time
      const [startH, startM] = startTime.split(':').map(Number);
      const startMins = startH * 60 + startM;

      const [endH, endM] = endTime.split(':').map(Number);
      const endMins = endH * 60 + endM;

      return bookingMins >= startMins && bookingMins < endMins;
    });

    // Process affected bookings
    const notifications = [];
    for (const b of affectedBookings) {
      // 1. Update status to Rescheduled
      await prisma.booking.update({
        where: { id: b.id },
        data: { status: "Rescheduled" }
      });

      // 2. Create Notification
      const msg = `Your appointment on ${date} at ${b.timeInput.split(' ').slice(1).join(' ')} has been rescheduled due to doctor unavailability. Please choose a new time.`;
      notifications.push(
        prisma.notification.create({
          data: {
            patientId: b.patientId,
            message: msg
          }
        })
      );
    }

    await Promise.all(notifications);

    return NextResponse.json({ success: true, leave, affectedCount: affectedBookings.length });

  } catch (error) {
    console.error("Leave POST Error:", error);
    return NextResponse.json({ success: false, error: "Failed to mark leave" }, { status: 500 });
  }
}
