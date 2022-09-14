const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const auth = (req, _, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    req.user = undefined;
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = user;
    return next();
  } catch {
    req.user = undefined;
    return next();
  }
};

module.exports = auth;
