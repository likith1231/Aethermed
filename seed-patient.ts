import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  await prisma.user.upsert({
    where: { email: 'patient@aethermed.com' },
    update: {},
    create: {
      email: 'patient@aethermed.com',
      name: 'John Doe',
      password: 'patient123',
      role: 'patient',
      phone: '+91 99000 11223'
    }
  })
  console.log('Seeded patient@aethermed.com')
}
main()
