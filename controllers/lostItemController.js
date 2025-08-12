const bcrypt = require("bcryptjs");
const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

const path = require("path");
const fs = require("fs");

const VALID_LOCATIONS = [
  "Downtown Yangon",
  "North Yangon",
  "South Yangon",
  "East Yangon",
  "West Yangon",
  "Other",
];

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
    // Validate location
    if (!VALID_LOCATIONS.includes(lostLocation)) {
      throw new Error("Invalid location selected.");
    }

    const parsedLostDate = new Date(lostDate); // this ensures Prisma gets a Date object
    const parsedReward = reward ? Math.floor(Number(reward)) : 0; // truncate decimals

    const imageFilenames = req.files.map((file) => file.filename) || [];
    // console.log("Uploaded files:", req.files);

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
        featured: featured === "on",
        userId: req.session.userId, // Assuming user ID is stored in session
        images: imageFilenames,
      },
    });

    res.redirect("/lost");
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
