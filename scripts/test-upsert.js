const { prisma } = require("../src/lib/prisma");

async function main() {
  const clerkId = "test_user_script";
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
