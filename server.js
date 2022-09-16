const express = require("express");
const cookieParser = require("cookie-parser");
const nunjucks = require("nunjucks");
const mongoose = require("mongoose");
require("dotenv").config();
const {
  handleInvalidUrlErrors,
  handleCustomErrors,
  handleServerErrors,
} = require("./errors/errors");

// routes
const index = require("./routes/index.routes.js");
const login = require("./routes/login.routes.js");
const logout = require("./routes/logout.routes.js");
const register = require("./routes/register.routes.js");
const users = require("./routes/users.routes.js");

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// SS rendering
nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

// DATABASE
//Set up default mongoose connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// routes
app.use("/login", login);
app.use("/logout", logout);
app.use("/register", register);
app.use("/users", users);
app.use("/", index);
app.all("*", handleInvalidUrlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

app.listen(process.env.PORT);
