const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.categoryType.findMany({
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: err.message });
  }
};
