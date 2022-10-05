const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../models/user.model.js");

router.get("/", (req, res) => {
  return res.render("login.njk");
});

router.post("/", async (req, res, next) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  const error = "Invalid username or password";
  if (user == null) {
    return res.render("login.njk", { error });
  }
  return bcrypt
    .compare(req.body.password, user.password)
    .then((valid) => {
      if (valid) {
        const token = jwt.sign({ user }, process.env.JWT_SECRET_KEY);
        return res
          .cookie("access_token", token, {
            httpOnly: true,
          })
          .status(200)
          .redirect("/");
      } else {
        return res.render("login.njk", { error });
      }
    })
    .catch(next);
});

module.exports = router;
