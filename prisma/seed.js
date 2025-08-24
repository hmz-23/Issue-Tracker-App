
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPasswordAdmin = await bcrypt.hash('password123', 10);
  const hashedPasswordUser = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPasswordAdmin,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: hashedPasswordUser,
      role: 'USER',
    },
  });

  await prisma.issue.create({
    data: {
      title: 'Initial Open Issue',
      body: 'This is a sample open issue created by the admin.',
      status: 'OPEN',
      authorId: admin.id,
      comments: {
        create: [
          { text: 'First comment!', authorId: user.id },
          { text: 'A second comment.', authorId: admin.id },
        ],
      },
    },
  });

  await prisma.issue.create({
    data: {
      title: 'Another issue, now closed',
      body: 'This is a sample closed issue.',
      status: 'CLOSED',
      authorId: user.id,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

