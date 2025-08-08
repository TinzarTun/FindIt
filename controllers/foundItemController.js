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
];

const VALID_CONDITIONS = [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Damaged",
  "Healthy",
  "Injured",
  "Sick",
  "Malnourished",
  "Deceased",
];

exports.getCreateFoundItem = async (req, res) => {
  try {
    const categories = await prisma.categoryType.findMany();

    res.render("post/found/create", {
      title: "Report Found Item",
      error: null,
      categories,
    });
  } catch (err) {
    console.error("Error loading categories:", err);
    res.render("post/found/create", {
      title: "Report Found Item",
      error: "Failed to load categories.",
      categories: [], // Fallback so EJS doesn’t crash
    });
  }
};

exports.postCreateFoundItem = async (req, res) => {
  const {
    itemTitle,
    categoryId,
    description,
    foundLocation,
    foundDate,
    locationDetails,
    condition,
    questionOne,
    questionTwo,
    questionThree,
  } = req.body;

  try {
    // Validate location
    if (!VALID_LOCATIONS.includes(foundLocation)) {
      throw new Error("Invalid location selected.");
    }
    // Validate condition
    if (!VALID_CONDITIONS.includes(condition)) {
      throw new Error("Invalid item condition selected.");
    }

    const parsedFoundDate = new Date(foundDate); // this ensures Prisma gets a Date object

    const imageFilenames = req.files.map((file) => file.filename) || [];
    // console.log("Uploaded files:", req.files);

    // Create found item in the database
    const foundItem = await prisma.foundItem.create({
      data: {
        title: itemTitle,
        description,
        categoryId,
        foundDate: parsedFoundDate,
        foundLocation,
        locationDetails,
        condition,
        questionOne,
        questionTwo,
        questionThree,
        userId: req.session.userId, // Assuming user ID is stored in session
        images: imageFilenames,
      },
    });

    res.redirect("/found");
  } catch (err) {
    console.error("Error creating found item:", err);
    const categories = await prisma.categoryType.findMany();
    res.render("post/found/create", {
      title: "Report Found Item",
      error: "Failed to create found item. Please try again.",
      categories,
    });
  }
};
