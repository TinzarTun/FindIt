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

  const { search, category, location, dateRange } = req.query;

  const filters = {};

  if (search) {
    filters.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (category) {
    filters.categoryId = category;
  }

  if (location) {
    filters.lostLocation = location;
  }

  if (dateRange) {
    const now = new Date();
    let fromDate;

    switch (dateRange) {
      case "today":
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "yesterday":
        fromDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1
        );
        break;
      case "week":
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
        break;
      case "month":
        fromDate = new Date(now);
        fromDate.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        fromDate = new Date(now);
        fromDate.setMonth(now.getMonth() - 3);
        break;
    }

    if (fromDate) {
      filters.lostDate = {
        gte: fromDate, // gte = "greater than or equal to"
      };
    }
  }

  try {
    const [lostItems, totalItems, categories] = await Promise.all([
      prisma.lostItem.findMany({
        where: filters,
        include: {
          category: true,
          user: true,
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.lostItem.count({ where: filters }),
      prisma.categoryType.findMany(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const startItem = totalItems === 0 ? 0 : skip + 1;
    const endItem = totalItems === 0 ? 0 : Math.min(skip + limit, totalItems);

    const queryString = new URLSearchParams({
      search: search || "",
      category: category || "",
      location: location || "",
      dateRange: dateRange || "",
    }).toString();

    res.render("post/lost/view", {
      title: "Lost Items",
      lostItems,
      currentPage: page,
      totalPages,
      totalItems,
      startItem,
      endItem,
      error: null,
      categories,
      search,
      selectedCategory: category || "",
      selectedLocation: location || "",
      selectedDateRange: dateRange || "",
      queryString,
    });
  } catch (err) {
    console.error("Error fetching lost items:", err);
    res.render("post/lost/view", {
      title: "Lost Items",
      lostItems: [],
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      startItem: 0,
      endItem: 0,
      error: "Failed to load lost items.",
      categories: [],
      search: search || "",
      selectedCategory: category || "",
      selectedLocation: location || "",
      selectedDateRange: dateRange || "",
      queryString: "",
    });
  }
};

exports.getDetailLostItem = async (req, res) => {
  const itemId = req.params.id;

  try {
    const lostItem = await prisma.lostItem.findUnique({
      where: { id: itemId },
      include: {
        category: true,
        user: true,
      },
    });

    if (!lostItem) {
      return res.status(404).render("error", {
        title: "Item Not Found",
        error: "The requested lost item does not exist.",
      });
    }

    function timeAgo(date) {
      const now = new Date();
      const diff = now - new Date(date);
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return days + (days === 1 ? " day ago" : " days ago");
      if (hours > 0) return hours + (hours === 1 ? " hour ago" : " hours ago");
      if (minutes > 0)
        return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
      return "just now";
    }

    res.render("post/lost/detail", {
      title: `Lost Item - ${lostItem.title}`,
      lostItem,
      timeAgo,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching lost item details:", err);
    res.status(500).render("error", {
      title: "Error",
      error: "Failed to load lost item details.",
    });
  }
};
