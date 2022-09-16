const express = require("express");
const router = express.Router();
const auth = require("../auth/auth.js");
const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.get("/:username", auth, async (req, res, next) => {
  const { username } = req.params;
  return User.findOne({ username })
    .then((profile) => {
      const loggedInUser = req.user;
      if (profile) {
        if (profile.username === loggedInUser.username) {
          profile.canEdit = true;
        } else {
          profile.canEdit = false;
        }
        return res.render("userProfile.njk", {
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
      .render("userProfile.njk", {
        loggedInUser: req.user,
        profile,
        schema: User.schema.obj,
      });
  } else {
    return res.status(401);
  }
});

router.post("/:username/changepassword", auth, async (req, res) => {
  const isLoggedIn = req.user;
  const isAuthorised = req.body.username === req.user.username;
  const user = await User.findOne({ _id });
  const oldPasswordMatchesCurrent = await bcrypt.compare(
    user.password,
    req.body.oldPassword
  );
  if (isLoggedIn && isAuthorised && oldPasswordMatchesCurrent) {
    user.password = req.newPassword;
    user.save();
  } else {
    return res.status(401).render("userProfile.njk", { invalidPassword: true });
  }
});

module.exports = router;
