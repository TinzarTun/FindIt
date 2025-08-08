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

const VALID_ITEM_CONDITIONS = [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Damaged",
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
