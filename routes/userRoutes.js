const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const multer = require("multer");
const path = require("path");

// Set custom storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/avatar"); // ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // gets .jpg/.png etc.
    cb(null, Date.now() + ext);
  },
});

// Use the multer middleware
const upload = multer({ storage });

router.post("/edit/:id/", upload.single("avatar"), userController.editUserInfo); // /user/edit/:id/

router.get("/profile", userController.getUser); // /user/profile
router.get("/edit/:id", userController.getEditUser); // /user/edit/:id
router.post("/edit/:id", userController.editUserInfo); // /user/edit/:id
router.get("/delete/:id", userController.delete); // /user/delete/:id

module.exports = router;
