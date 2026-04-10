const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const clerkId = "test_user_cjs";
  const plan = "pro";

  const user = await prisma.user.upsert({
    where: { clerkId },
    update: { plan },
    create: { clerkId, plan },
  });

  console.log("Upserted user:", {
    id: user.id,
    clerkId: user.clerkId,
    plan: user.plan,
  });
}

main()
  .catch((e) => {
    console.error("Error during upsert:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
