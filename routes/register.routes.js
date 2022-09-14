const express = require("express");
const router = express.Router();
const User = require("../models/user.model.js");

router.get("/", async (req, res) => {
  console.log(User.schema.obj.username.match);
  const patterns = Object.keys(User.schema.obj).map((key) => {
    const pattern = User.schema.obj[key];
    return { key, pattern };
  });
  console.log(patterns);
  return res.render("register.njk", { schema: User.schema.obj });
});

router.post("/", async (req, res, next) => {
  const { firstname, surname, dateOfBirth, username, email, password } =
    req.body;
  console.log({ firstname, surname, dateOfBirth, username, email, password });
  const user = new User({
    firstname,
    surname,
    dateOfBirth,
    username,
    email,
    password,
  });
  try {
    user.save();
    return res.status(201).redirect("/login");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
