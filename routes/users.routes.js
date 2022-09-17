const express = require("express");
const router = express.Router();
const auth = require("../auth/auth.js");
const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.get("/:username", auth, async (req, res, next) => {
  const {passwordChange} = req.query
  const { username } = req.params;
  return User.findOne({ username })
    .then((profile) => {
      const currentUser = req.user;
      if (profile) {
        if (profile.username === currentUser.username) {
          profile.canEdit = true;
        } else {
          profile.canEdit = false;
        }
        return res.render("userProfile.njk", {
          currentUser,
          profile,
          schema: User.schema.obj,
          passwordChange
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
        setPassword: req.query.setPassword,
        currentUser: req.user,
        profile,
        schema: User.schema.obj,
      });
  } else {
    return res.status(401);
  }
});

router.post("/:username/changepassword", auth, async (req, res) => {
  console.log("updating password...");
  const isLoggedIn = req.user;
  const isAuthorised = req.body._id === req.user._id;
  const user = await User.findById(req.body._id).exec();
  const oldPasswordCorrect = await bcrypt.compare(
    req.body.oldPassword,
    user.password
  );
  console.log(isLoggedIn, isAuthorised, oldPasswordCorrect);
  if (isLoggedIn && isAuthorised && oldPasswordCorrect) {
    user.password = req.body.newPassword;
    user
      .save()
      .then((profile) => {
        // success
        console.log(profile)
        return res.redirect(`/users/${req.params.username}?passwordChange=success`);
      })
      .catch(() => {
        // error
        console.log('database error')
        return res.redirect(`/users/${req.params.username}?passwordChange=error`);
      });
  } else {
    // unauthorised
        return res.redirect(`/users/${req.params.username}?passwordChange=fail`);
  }
});

module.exports = router;
