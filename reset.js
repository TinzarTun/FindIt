const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log("Starting database reset...");

    // Delete from child to parent to respect relations
    await prisma.message.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.claim.deleteMany();
    await prisma.foundItem.deleteMany();
    await prisma.lostItem.deleteMany();
    await prisma.user.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.categoryType.deleteMany();

    console.log("All data deleted successfully!");
  } catch (error) {
    console.error("Error deleting data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
