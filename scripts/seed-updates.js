const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed script...");

  // 1. Assign doctor@aethermed.com to MedPlus clinic
  const doctor = await prisma.user.findFirst({
    where: { email: 'doctor@aethermed.com' }
  });
  
  if (!doctor) {
    console.error("Doctor not found!");
    return;
  }

  const medPlusClinic = await prisma.clinic.findFirst({
    where: { name: 'MedPlus Healthcare Centre - Yeshwanthpur' }
  });

  if (medPlusClinic) {
    await prisma.user.update({
      where: { id: doctor.id },
      data: { clinicId: medPlusClinic.id }
    });
    console.log(`Updated Doctor ${doctor.email} to clinic ${medPlusClinic.name}`);
  }

  // 2. Add SlotConfigs for clinics
  // MedPlus: 07:30 to 22:30, no lunch break
  if (medPlusClinic) {
    await prisma.slotConfig.upsert({
      where: { clinicId: medPlusClinic.id },
      update: {
        startTime: '07:30',
        endTime: '22:30',
        lunchStartTime: null,
        lunchEndTime: null,
        slotDuration: 30,
        maxPerSlot: 3
      },
      create: {
        clinicId: medPlusClinic.id,
        startTime: '07:30',
        endTime: '22:30',
        lunchStartTime: null,
        lunchEndTime: null,
        slotDuration: 30,
        maxPerSlot: 3
      }
    });
    console.log("Updated SlotConfig for MedPlus");
  }

  const indiranagarClinic = await prisma.clinic.findFirst({
    where: { name: 'Indiranagar Care Hub' }
  });

  if (indiranagarClinic) {
    await prisma.slotConfig.upsert({
      where: { clinicId: indiranagarClinic.id },
      update: {
        startTime: '09:00',
        endTime: '21:00',
        lunchStartTime: '13:00',
        lunchEndTime: '14:00',
        slotDuration: 30,
        maxPerSlot: 3
      },
      create: {
        clinicId: indiranagarClinic.id,
        startTime: '09:00',
        endTime: '21:00',
        lunchStartTime: '13:00',
        lunchEndTime: '14:00',
        slotDuration: 30,
        maxPerSlot: 3
      }
    });
    console.log("Updated SlotConfig for Indiranagar");
  }

  console.log("Seed script finished successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
