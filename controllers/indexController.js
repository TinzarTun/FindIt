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
        orderBy: [
          { category: { isAlive: "desc" } },
          { featured: "desc" },
          { createdAt: "desc" },
        ],
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
        user: {
          include: {
            lostItems: true,
          },
        },
      },
    });

    if (!lostItem) {
      return res.status(404).render("error", {
        title: "Item Not Found",
        error: "The requested lost item does not exist.",
      });
    }

    // Helper function
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

    // limit the search for similar lost items to only those reported in the last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Fetch similar lost items
    const similarItemsRaw = await prisma.lostItem.findMany({
      where: {
        id: { not: itemId },
        categoryId: lostItem.categoryId,
        lostLocation: lostItem.lostLocation,
        status: "LOST",
        lostDate: {
          gte: sixtyDaysAgo,
        },
      },
      select: {
        id: true,
        title: true,
        lostLocation: true,
        lostDate: true,
        images: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        lostDate: "desc",
      },
      take: 4,
    });

    const similarItems = similarItemsRaw.map((item) => ({
      id: item.id,
      title: item.title,
      lostLocation: item.lostLocation,
      images: item.images || [],
      lostDate: item.lostDate,
      category: item.category,
    }));

    res.render("post/lost/detail", {
      title: `Lost Item - ${lostItem.title}`,
      lostItem,
      timeAgo,
      similarItems,
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

exports.getFoundItemsPage = async (req, res) => {
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
    filters.foundLocation = location;
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
      filters.foundDate = {
        gte: fromDate, // gte = "greater than or equal to"
      };
    }
  }

  try {
    const [foundItems, totalItems, categories] = await Promise.all([
      prisma.foundItem.findMany({
        where: filters,
        include: {
          category: true,
          user: true,
        },
        orderBy: [{ category: { isAlive: "desc" } }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.foundItem.count({ where: filters }),
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

    res.render("post/found/view", {
      title: "Found Items",
      foundItems,
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
    console.error("Error fetching found items:", err);
    res.render("post/found/view", {
      title: "Found Items",
      foundItems: [],
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      startItem: 0,
      endItem: 0,
      error: "Failed to load found items.",
      categories: [],
      search: search || "",
      selectedCategory: category || "",
      selectedLocation: location || "",
      selectedDateRange: dateRange || "",
      queryString: "",
    });
  }
};

exports.getDetailFoundItem = async (req, res) => {
  const itemId = req.params.id;

  try {
    const foundItem = await prisma.foundItem.findUnique({
      where: { id: itemId },
      include: {
        category: true,
        user: {
          include: {
            foundItems: true,
          },
        },
      },
    });

    if (!foundItem) {
      return res.status(404).render("error", {
        title: "Item Not Found",
        error: "The requested found item does not exist.",
      });
    }

    // Helper function
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

    // limit the search for similar found items to only those reported in the last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Fetch similar found items
    const similarItemsRaw = await prisma.foundItem.findMany({
      where: {
        id: { not: itemId },
        categoryId: foundItem.categoryId,
        foundLocation: foundItem.foundLocation,
        status: "FOUND",
        foundDate: {
          gte: sixtyDaysAgo,
        },
      },
      select: {
        id: true,
        title: true,
        foundLocation: true,
        foundDate: true,
        images: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        foundDate: "desc",
      },
      take: 4,
    });

    const similarItems = similarItemsRaw.map((item) => ({
      id: item.id,
      title: item.title,
      foundLocation: item.foundLocation,
      images: item.images || [],
      foundDate: item.foundDate,
      category: item.category,
    }));

    res.render("post/found/detail", {
      title: `Found Item - ${foundItem.title}`,
      foundItem,
      timeAgo,
      similarItems,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching found item details:", err);
    res.status(500).render("error", {
      title: "Error",
      error: "Failed to load found item details.",
    });
  }
};
