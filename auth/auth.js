const jwt = require("jsonwebtoken");

const auth = (req, _, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    req.user = undefined;
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET_KEY).user;
    return next();
  } catch {
    req.user = undefined;
    return res.status(401).redirect("logout.njk");
  }
};

module.exports = auth;
