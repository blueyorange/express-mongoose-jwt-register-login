const express = require("express");
const router = express.Router();
const auth = require("../auth/auth.js");
const User = require("../models/user.model.js");
const moment = require("moment");
const jwt = require("jsonwebtoken");

router.get("/:username", auth, async (req, res, next) => {
  const { username } = req.params;
  return User.findOne({ username })
    .then((user) => {
      const dateOfBirth = moment(user.dateOfBirth)
        .format("YYYY-MM-DD")
        .toString()
        .slice(0, 10);
      const profile = { ...user._doc, dateOfBirth };
      console.log(profile);
      const loggedInUser = req.user;
      if (profile) {
        if (profile.username === loggedInUser.username) {
          profile.canEdit = true;
        } else {
          profile.canEdit = false;
        }
        return res.render("users.njk", {
          loggedInUser: req.user,
          profile,
          schema: User.schema.obj,
        });
      } else {
        return res.render("404.njk");
      }
    })
    .catch(next);
});

router.post("/:username", auth, async (req, res, next) => {
  console.log(req.body);
  if (req.body.username === req.user.username) {
    const update = req.body;
    const filter = { _id: req.body._id };
    const profile = await User.findOneAndUpdate(filter, update, { new: true });
    profile.canEdit = true;
    const token = jwt.sign({ user: profile }, process.env.JWT_SECRET_KEY);
    return res
      .cookie("access_token", token, {
        httpOnly: true,
        overwrite: true,
      })
      .render("users.njk", {
        loggedInUser: req.user,
        profile,
        schema: User.schema.obj,
      });
  } else {
    return res.status(401);
  }
});

module.exports = router;
