const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");

router.get("/", indexController.getHomePage);
router.get("/post", indexController.getPostPage);

module.exports = router;
