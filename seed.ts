import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@aethermed.com' },
    update: {},
    create: {
      email: 'admin@aethermed.com',
      name: 'System Admin',
      password: 'admin123',
      role: 'admin'
    }
  })
  console.log('Seeded admin@aethermed.com')
}
main()
