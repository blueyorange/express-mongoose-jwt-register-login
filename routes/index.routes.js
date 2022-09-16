const express = require("express");
const router = express.Router();
const auth = require("../auth/auth.js");

router.get("/", auth, (req, res) => {
  if (req.user) {
    return res.render("index.njk", { currentUser: req.user });
  } else {
    return res.redirect("/login");
  }
});

module.exports = router;
