const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

exports.getHomePage = (_, res) => {
  res.render("index", { title: "Home", error: null });
};

exports.getPostPage = (_, res) => {
  res.render("post/post", { title: "Post", error: null });
};

exports.getLostItemsPage = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  try {
    const [lostItems, totalItems] = await Promise.all([
      prisma.lostItem.findMany({
        include: {
          category: true,
          user: true,
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.lostItem.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.render("post/lost/view", {
      title: "Lost Items",
      lostItems,
      currentPage: page,
      totalPages,
      totalItems,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching lost items:", err);
    res.render("post/lost/view", {
      title: "Lost Items",
      lostItems: [],
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      error: "Failed to load lost items.",
    });
  }
};
