const bcrypt = require("bcryptjs");
const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

exports.getCreateLostItem = async (req, res) => {
  try {
    const categories = await prisma.categoryType.findMany({
      orderBy: { name: "asc" },
    });

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

exports.postCreateLostItem = (req, res) => {
  //
};

// exports.postCreatePost = async (req, res) => {
//   const { title, content } = req.body;
//   await prisma.post.create({
//     data: {
//       title,
//       content,
//       authorId: req.session.userId,
//     },
//   });
//   res.redirect("/posts");
// };

// exports.getEditPost = async (req, res) => {
//   const post = await prisma.post.findUnique({
//     where: { id: req.params.id, authorId: req.session.userId },
//   });
//   if (!post) return res.redirect("/posts");
//   res.render("posts/edit", { post, title: "post edit" }); // view(ui=>edit.ejs)
// };

// exports.postEditPost = async (req, res) => {
//   const { title, content } = req.body;
//   await prisma.post.update({
//     where: { id: req.params.id, authorId: req.session.userId },
//     data: { title, content },
//   });
//   res.redirect("/posts");
// };

// exports.postDeletePost = async (req, res) => {
//   await prisma.post.delete({
//     where: { id: req.params.id, authorId: req.session.userId },
//   });
//   res.redirect("/posts");
// };
