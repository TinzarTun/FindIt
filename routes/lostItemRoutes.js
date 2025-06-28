const express = require("express");
const router = express.Router();
const lostItemController = require("../controllers/lostItemController");

router.get("/create", lostItemController.getCreateLostItem); // /lost/create
router.post("/create", lostItemController.postCreateLostItem);

module.exports = router;
