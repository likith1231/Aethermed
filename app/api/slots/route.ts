import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clinicId = searchParams.get('clinicId');
  const dateStr = searchParams.get('date');

  if (!clinicId || !dateStr) {
    return NextResponse.json({ error: "Missing clinicId or date" }, { status: 400 });
  }

  try {
    const clinic = await prisma.clinic.findFirst({
      where: {
        OR: [
          { id: clinicId },
          { name: clinicId } // fallback in case the frontend sends name instead of id
        ]
      },
      include: {
        slotConfig: true,
        leaves: {
          where: { date: dateStr }
        }
      }
    });

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    const config = clinic.slotConfig || {
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 30,
      maxPerSlot: 3
    };

    // Calculate slots
    const startHour = parseInt(config.startTime.split(':')[0]);
    const startMin = parseInt(config.startTime.split(':')[1]);
    const endHour = parseInt(config.endTime.split(':')[0]);
    const endMin = parseInt(config.endTime.split(':')[1]);

    const slots = [];
    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      slots.push(timeString);
      
      currentMin += config.slotDuration;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }

    // Get bookings for this date and clinic to calculate availability
    // Note: bookings use string 'date' field in this app, wait let me check schema
    // bookings have `timeInput` (e.g. "2023-10-25 09:00 AM") or a `createdAt`
    
    // We should parse timeInput or check what frontend sends.
    // The frontend sends `timeInput: "${bookingFormData.date} ${bookingFormData.appointmentTimeSlot}"`
    // Let's fetch all bookings for the clinic
    const allBookings = await prisma.booking.findMany({
      where: { clinicId: clinic.id }
    });
    
    // Filter by date string matching
    const dateBookings = allBookings.filter((b: any) => b.timeInput && b.timeInput.includes(dateStr));
    
    const slotAvailability = slots.map(slot => {
      // convert 24h slot to AM/PM for matching
      const [h, m] = slot.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      const formattedSlot = `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
      
      const taken = dateBookings.filter((b: any) => b.timeInput.includes(formattedSlot)).length;
      const slotMins = hour * 60 + parseInt(m, 10);
      
      let isLeave = false;
      const leaves = clinic.leaves || [];
      for (const leave of leaves) {
        if (!leave.startTime || !leave.endTime) {
           isLeave = true; // full day leave
           break;
        }
        const startMins = parseInt(leave.startTime.split(':')[0]) * 60 + parseInt(leave.startTime.split(':')[1]);
        const endMins = parseInt(leave.endTime.split(':')[0]) * 60 + parseInt(leave.endTime.split(':')[1]);
        if (slotMins >= startMins && slotMins < endMins) {
           isLeave = true;
           break;
        }
      }

      let isLunch = false;
      const slotConfig = clinic.slotConfig;
      if (slotConfig && slotConfig.lunchStartTime && slotConfig.lunchEndTime) {
        const lunchStartMins = parseInt(slotConfig.lunchStartTime.split(':')[0]) * 60 + parseInt(slotConfig.lunchStartTime.split(':')[1]);
        const lunchEndMins = parseInt(slotConfig.lunchEndTime.split(':')[0]) * 60 + parseInt(slotConfig.lunchEndTime.split(':')[1]);
        if (slotMins >= lunchStartMins && slotMins < lunchEndMins) {
           isLunch = true;
        }
      }

      // Past slot filtering
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const nowTotalMins = now.getHours() * 60 + now.getMinutes();
      const isPast = isToday && slotMins <= nowTotalMins;

      const isFull = isLeave || isLunch || isPast || taken >= config.maxPerSlot;
      let reason = "";
      if (isPast) reason = "Time Passed";
      else if (isLeave) reason = "Doctor on Leave";
      else if (isLunch) reason = "Lunch Break";
      else if (taken >= config.maxPerSlot) reason = "Full";
      
      return {
        time: formattedSlot,
        raw24h: slot,
        available: (isLeave || isLunch || isPast) ? 0 : config.maxPerSlot - taken,
        total: config.maxPerSlot,
        isFull: isFull,
        reason: reason
      };
    });

    return NextResponse.json({
      config,
      slots: slotAvailability
    });

  } catch (error) {
    console.error("Slots API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
