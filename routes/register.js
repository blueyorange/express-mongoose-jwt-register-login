const express = require("express");
const router = express.Router();
const User = require("../models/user.model.js");

router.get("/", async (req, res) => {
  return res.render("register.njk", { schema: User.schema.obj });
});

router.post("/", async (req, res, next) => {
  const { name, surname, dateOfBirth, username, email, password } = req.body;
  const user = new User({
    name,
    surname,
    dateOfBirth,
    username,
    email,
    password,
  });
  user
    .save()
    .then(() => {
      return res.status(201).redirect("/login");
    })
    .catch(next);
});

module.exports = router;
