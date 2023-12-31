// require("dotenv").config({ path: "/opt/doe/.env" });
require("dotenv").config()
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var db = require("./utils/dbConnect");
var homeRouter = require("./routes/homeRoute");
var indexRouter = require("./routes/index");
var adminRouter = require("./routesAdmin/index");
var cors = require("cors");
var app = express();
const cronJobs = require("./utils/cronJobs");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");	
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", homeRouter);
app.use("/users", indexRouter);
app.use("/admin", adminRouter);

// app.use("/common", "...")

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
