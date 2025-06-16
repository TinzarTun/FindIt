const express = require("express");
const router = express.Router();
const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

router.get("/", (req, res) => {
  res.render("index", {
    title: "Home",
  });
});

module.exports = router;
