import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LABELS = ['Research', 'Design', 'Development', 'Testing', 'Deployment'];

async function main() {
  for (const name of LABELS) {
    await prisma.label.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seeded ${LABELS.length} labels.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
