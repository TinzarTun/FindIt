const express = require("express");
const router = express.Router();
const lostItemController = require("../controllers/lostItemController");

const upload = require("../middlewares/multerLost");

router.get("/create", lostItemController.getCreateLostItem); // /lost/create
// router.post("/create", lostItemController.postCreateLostItem);
router.post(
  "/create",
  upload.array("images", 5),
  lostItemController.postCreateLostItem
);
// router.get("/edit/:id", lostItemController.getEditLostItem);
// router.post("/edit/:id", lostItemController.postEditLostItem);
// router.post("/delete/:id", lostItemController.postDeleteLostItem);

module.exports = router;
