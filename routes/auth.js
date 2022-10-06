const express = require("express");
const router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var bcrypt = require('bcrypt');
const User = require("../models/user.model.js");

passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await User.findOne({username});
  if (!user) return cb(null, false, { message: 'Incorrect username or password.' });
  const match = await bcrypt.compare(password, user.password)
  if (match) {
    return cb(null, user)
  } else {
    return cb(null, false, {message: 'Incorrect username or password.'})
  }
}));

passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(function(_id, cb) {
  User.findById(_id).then(user => cb(null, user))
});

router.get("/login", (req, res) => {
  return res.render("login.njk", 
  {error : req.flash('error')[0]}
);
});

router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true,
}));

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
