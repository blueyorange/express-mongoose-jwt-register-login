const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (req.user) {
    return res.render("index.njk", { currentUser: req.user });
  } else {
    return res.redirect("/auth/login");
  }
});

module.exports = router;
