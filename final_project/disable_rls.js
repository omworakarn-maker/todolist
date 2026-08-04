const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "Todo" DISABLE ROW LEVEL SECURITY;');
  console.log('RLS disabled for Todo table');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
