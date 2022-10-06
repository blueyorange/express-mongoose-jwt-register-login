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
var passport = require('passport');
var session = require('express-session');
const MongoStore = require('connect-mongo')

// routes
const index = require("./routes/index.js");
const auth = require("./routes/auth.js");
const register = require("./routes/register.js");
const users = require("./routes/users.js");

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(session({
  secret: process.env.SECRET,
  store: MongoStore.create({mongoUrl: process.env.MONGO_URI}),
  saveUninitialized: false,
  resave: false,
  // cookie: {secure: true}
}));
app.use(passport.authenticate('session'));

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
app.use("/auth", auth);
app.use("/register", register);
app.use("/users", users);
app.use("/", index);
app.all("*", handleInvalidUrlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

app.listen(process.env.PORT);
