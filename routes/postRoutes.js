const express = require("express");
const router = express.Router();

router.get("/post", (req, res) => {
  res.render("post/post", { title: "Post" });
});

module.exports = router;
