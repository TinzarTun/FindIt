const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

const fs = require("fs").promises;
const path = require("path");

async function deleteFilesInDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.lstat(filePath);

      if (stat.isFile()) {
        await fs.unlink(filePath);
        console.log(`Deleted: ${filePath}`);
      }
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn(`Folder not found: ${dirPath}`);
    } else {
      console.error(`Error deleting files in ${dirPath}:`, err);
    }
  }
}

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

    console.log("All database records deleted.");

    // Delete uploaded files
    const avatarPath = path.join(__dirname, "../FindIt/public/uploads/avatar");
    const lostItemsPath = path.join(
      __dirname,
      "../FindIt/public/uploads/lost-items"
    );

    await deleteFilesInDirectory(avatarPath);
    await deleteFilesInDirectory(lostItemsPath);

    console.log("All uploaded files deleted.");
  } catch (error) {
    console.error("Error during reset:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
