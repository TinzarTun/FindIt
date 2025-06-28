const bcrypt = require("bcryptjs");
const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

exports.getCreateLostItem = (_, res) => {
  res.render("lost/create", { title: "Report Lost Item", error: null });
};

exports.postCreateLostItem = (req, res) => {
  //
};
