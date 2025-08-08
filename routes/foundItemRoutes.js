const express = require("express");
const router = express.Router();
const foundItemController = require("../controllers/foundItemController");

const upload = require("../middlewares/multerFound");

router.get("/create", foundItemController.getCreateFoundItem); // /found/create
// router.post(
//   "/create",
//   upload.array("images", 5),
//   foundItemController.postCreateFoundItem
// );
// router.get("/edit/:id", foundItemController.getEditFoundItem);
// router.post("/edit/:id", foundItemController.postEditFoundItem);
// router.post("/delete/:id", foundItemController.postDeleteFoundItem);

module.exports = router;
