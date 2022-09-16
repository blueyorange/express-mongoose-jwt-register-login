const express = require("express");
const router = express.Router();
const auth = require("../auth/auth.js");

router.get("/", auth, (req, res) => {
  const loggedInUser = req.user;
  if (loggedInUser) {
    return res.render("index.njk", { loggedInUser });
  } else {
    return res.redirect("/login");
  }
});

module.exports = router;
