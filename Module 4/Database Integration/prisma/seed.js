const prisma = require('../src/database/prisma');
const posts = require('../src/data/postSeed');

async function seed() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.test' },
    update: {},
    create: { name: 'Demo User', email: 'demo@example.test' },
  });

  for (const post of posts) {
    const existingPost = await prisma.post.findFirst({
      where: { authorId: user.id, title: post.title },
    });
    if (!existingPost) {
      await prisma.post.create({
        data: { title: post.title, body: post.body, authorId: user.id },
      });
    }
  }

  console.log(`Seeded demo user with id ${user.id}`);
}

seed()
  .catch(() => {
    console.error('Database seeding failed');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
