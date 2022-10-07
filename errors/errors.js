exports.handleInvalidUrlErrors = (req, res) => {
  res.status(404).render("404.njk");
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err._message && err._message.includes("validation")) {
    res.status(400).render(register);
  } else {
    next(err);
  }
};
exports.handleServerErrors = (err, req, res, next) => {
  const error = {code : "500 server error", message: err}
  res.status(500).render("error.njk", error)
};
