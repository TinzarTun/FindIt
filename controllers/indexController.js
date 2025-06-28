const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

exports.getHomePage = (_, res) => {
  res.render("index", { title: "Home", error: null });
};

exports.getPostPage = (_, res) => {
  res.render("post/post", { title: "Post", error: null });
};