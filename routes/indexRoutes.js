const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");

router.get("/", indexController.getHomePage);
router.get("/post", indexController.getPostPage);
router.get("/lost", indexController.getLostItemsPage);
router.get("/lost/detail/:id", indexController.getDetailLostItem);
router.get("/found", indexController.getFoundItemsPage);
router.get("/found/detail/:id", indexController.getDetailFoundItem);

module.exports = router;
