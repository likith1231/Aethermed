import { PrismaClient } from '@prisma/client'
try {
  const p = new PrismaClient({ url: 'file:./dev.db' } as any)
  console.log('Success')
} catch(e) {
  console.log('Error', e)
}
