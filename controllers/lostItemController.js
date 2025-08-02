const bcrypt = require("bcryptjs");
const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

exports.getCreateLostItem = async (req, res) => {
  try {
    const categories = await prisma.categoryType.findMany();

    res.render("post/lost/create", {
      title: "Report Lost Item",
      error: null,
      categories,
    });
  } catch (err) {
    console.error("Error loading categories:", err);
    res.render("post/lost/create", {
      title: "Report Lost Item",
      error: "Failed to load categories.",
      categories: [], // Fallback so EJS doesn’t crash
    });
  }
};

const path = require("path");
const fs = require("fs");

exports.postCreateLostItem = async (req, res) => {
  const {
    itemTitle,
    description,
    categoryId,
    lostLocation,
    lostDate,
    locationDetails,
    reward,
    featured,
  } = req.body;

  try {
    // Validate required fields
    // if (!itemTitle || !description || !categoryId || !locationDetails) {
    //   const categories = await prisma.categoryType.findMany();
    //   return res.render("post/lost/create", {
    //     title: "Report Lost Item",
    //     error: "Please fill in all required fields.",
    //     categories,
    //   });
    // }

    const parsedLostDate = new Date(lostDate); // ✅ This ensures Prisma gets a Date object
    const parsedReward = reward ? parseFloat(reward) : null;

    // Create lost item in the database
    const lostItem = await prisma.lostItem.create({
      data: {
        title: itemTitle,
        description,
        categoryId,
        lostDate: parsedLostDate,
        lostLocation,
        locationDetails,
        reward: parsedReward || 0, // Default to 0 if not provided
        featured: featured === "true",
        userId: req.session.userId, // Assuming user ID is stored in session
      },
    });

    // res.redirect(`/lost/${lostItem.id}`); // Redirect to the newly created lost item page
    res.redirect("/user/profile");
  } catch (err) {
    console.error("Error creating lost item:", err);
    const categories = await prisma.categoryType.findMany();
    res.render("post/lost/create", {
      title: "Report Lost Item",
      error: "Failed to create lost item. Please try again.",
      categories,
    });
  }
};
