const express = require("express");
const router = express.Router();
const auth = require("../auth/auth.js");

router.get("/", auth, (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect("/login");
  } else {
    return res.render("index.njk");
  }
});

module.exports = router;
