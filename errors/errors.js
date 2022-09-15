exports.handleInvalidUrlErrors = (req, res) => {
  res.status(404).render("404.njk");
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err._message.includes("validation")) {
    res.status(400).send();
  } else {
    next(err);
  }
};
exports.handleServerErrors = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal server error" });
};
