const express = require("express");
const router = express.Router();
const auth = require("../auth/auth.js");

router.get("/", auth, (req, res) => {
  return res.clearCookie("access_token").status(200).redirect("/login");
});

module.exports = router;
