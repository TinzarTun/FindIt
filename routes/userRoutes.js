const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

const multer = require("multer");
const path = require("path");

// Set custom storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/avatar"); // ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // gets .jpg/.png etc.
    cb(null, Date.now() + ext);
  },
});

// File filter for image formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and GIF images are allowed."));
  }
};

// Use the multer middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

router.post("/edit/:id", upload.single("avatar"), userController.editUserInfo); // /user/edit/:id/

router.get("/profile", userController.getUser); // /user/profile
router.get("/view/:id", userController.getUserById); // /user/view/:id
router.get("/edit/:id", userController.getEditUser); // /user/edit/:id
router.post("/edit/:id", userController.editUserInfo); // /user/edit/:id
router.get("/delete/:id", userController.delete); // /user/delete/:id

// Error handler for multer
router.use(async (err, req, res, next) => {
  const userId = req.params.id || req.session.userId;

  if (!userId) {
    return res.status(400).send("Missing user ID in URL.");
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).send("User not found.");
    }

    return res.status(400).render("user/edit", {
      user: existingUser,
      error:
        err instanceof multer.MulterError
          ? "File too large. Maximum size is 5MB."
          : err.message || "File upload error",
      title: "Edit Profile",
    });
  } catch (dbError) {
    console.error("Error fetching user in error handler:", dbError);
    return res.status(500).send("Something went wrong");
  }
});

module.exports = router;
