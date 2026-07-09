import { PrismaClient } from '@prisma/client'
try {
  const p = new PrismaClient({ log: ['error'] })
  console.log('Success')
} catch(e) {
  console.log('Error', e)
}
