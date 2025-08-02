const express = require("express");
const router = express.Router();
const lostItemController = require("../controllers/lostItemController");

router.get("/create", lostItemController.getCreateLostItem); // /lost/create
router.post("/create", lostItemController.postCreateLostItem);
// router.get("/edit/:id", lostItemController.getEditLostItem);
// router.post("/edit/:id", lostItemController.postEditLostItem);
// router.post("/delete/:id", lostItemController.postDeleteLostItem);

module.exports = router;
