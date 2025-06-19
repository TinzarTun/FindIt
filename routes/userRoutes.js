const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/profile", userController.getuser); // /user/profile
// router.get("/register", authController.getRegister); // /auth/register but get method
// router.post("/register", authController.postRegister); // /auth/register but post method
// router.get("/login", authController.getLogin); // /auth/login but get method
// router.post("/login", authController.postLogin); // /auth/login but post method
// router.get("/logout", authController.logout); // /auth/logout and get method

module.exports = router;
