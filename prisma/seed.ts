// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding the database...');

  // --- Seed Users ---
  // The `upsert` function is used here to avoid creating duplicate users
  // if you run the seeder multiple times.
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: 'password123',
      role: 'ADMIN',
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: 'password123',
      role: 'USER',
    },
  });

  console.log('Seeded users:', { adminUser, regularUser });

  // --- Seed Issues ---
  // Note: We use `create` here because we don't need to check for existing issues.
  // We also no longer hardcode the UUID for `id`, allowing Prisma to generate it.
  const issue1 = await prisma.issue.create({
    data: {
      title: 'Database connection problem',
      body: 'The application is unable to connect to the database. Getting an error: P1001.',
      status: 'OPEN',
      authorId: adminUser.id,
    },
  });

  const issue2 = await prisma.issue.create({
    data: {
      title: 'Authentication is not working',
      body: 'Users are unable to log in with their credentials. Need to debug the login route.',
      status: 'CLOSED',
      authorId: regularUser.id,
    },
  });

  console.log('Seeded issues:', { issue1, issue2 });

  // --- Seed Comments ---
  // Same as with issues, we use `create` and let Prisma generate the UUID.
  const comment1 = await prisma.comment.create({
    data: {
      text: 'I will be looking into this issue shortly.',
      authorId: adminUser.id,
      issueId: issue1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      text: 'Found the root cause. A configuration file was misconfigured.',
      authorId: regularUser.id,
      issueId: issue2.id,
    },
  });

  console.log('Seeded comments:', { comment1, comment2 });

  console.log('Seeding finished.');
}

// Run the main function and handle errors
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
