const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n=== USUÁRIOS NO BANCO DE DADOS ===\n');

  const users = await prisma.user.findMany({
    include: {
      UserRole: true
    },
    orderBy: {
      email: 'asc'
    }
  });

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.UserRole?.name || 'N/A'}`);
    console.log(`   Status: ${user.status}`);
    console.log('');
  });

  console.log(`Total: ${users.length} usuários\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
