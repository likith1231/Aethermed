const { prisma } = require('./app/lib/prisma');

async function test() {
  const user = await prisma.user.findUnique({ where: { email: 'dr@aethermed.com' } });
  console.log('User from app generated prisma:', user);
  prisma.$disconnect();
}
test();
