const express = require("express");
const router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var GoogleStrategy = require('passport-google-oidc')
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

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/auth/oauth2/redirect/google',
  scope: [ 'profile' ]
}, async function verify(issuer, profile, cb) {
  console.log(issuer, profile)
  const user = await User.findOne({id: profile.id, source: issuer})
  if (!user) {
    return User.create({source : issuer, id : profile.id, username: profile.displayName, name : profile.name.givenName, surname : profile.name.familyName})
  } else {
    return cb(null, user)
  }
  // db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
  //   issuer,
  //   profile.id
  // ], function(err, row) {
  //   if (err) { return cb(err); }
  //   if (!row) {
  //     db.run('INSERT INTO users (name) VALUES (?)', [
  //       profile.displayName
  //     ], function(err) {
  //       if (err) { return cb(err); }

  //       var id = this.lastID;
  //       db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
  //         id,
  //         issuer,
  //         profile.id
  //       ], function(err) {
  //         if (err) { return cb(err); }
  //         var user = {
  //           id: id,
  //           name: profile.displayName
  //         };
  //         return cb(null, user);
  //       });
  //     });
  //   } else {
  //     db.get('SELECT * FROM users WHERE id = ?', [ row.user_id ], function(err, row) {
  //       if (err) { return cb(err); }
  //       if (!row) { return cb(null, false); }
  //       return cb(null, row);
  //     });
  //   // }
  // }
  // );
}));

passport.serializeUser(function(user, cb) {
  return cb(null, user._id);
});

passport.deserializeUser(function(_id, cb) {
  return User.findById(_id).then(user => cb(null, user))
});

router.get("/login", (req, res) => {
  return res.render("login.njk", 
  {error : req.flash('error')[0], GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID}
);
});

router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true,
}));

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
