const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");

router.get("/", indexController.getHomePage);
router.get("/post", indexController.getPostPage);
router.get("/lost", indexController.getLostItemsPage);
router.get("/lost/detail/:id", indexController.getDetailLostItem);

module.exports = router;
