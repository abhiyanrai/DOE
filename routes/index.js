var express = require("express");
var router = express.Router();
var usersRouter = require("./users");
var usersEssentialRouter = require("./essentialNumber");
var usersSosRouter = require("./sos");
var usersDocRouter = require("./document");
var usersMapRouter = require("./map");
var jobsRoute = require("./jobs");
var newRoute = require("./news");
const entertainmentRoute = require("./entertainment");
const livingRoute = require("./living");
const course = require("./course");
const productsRoute = require("./products");

router.use("/", usersRouter);
router.use("/essentialNumber", usersEssentialRouter);
router.use("/Sos", usersSosRouter);
router.use("/document", usersDocRouter);
router.use("/map", usersMapRouter);
router.use("/userJobs", jobsRoute);
router.use("/newsAndArticles", newRoute);
router.use("/entertainment", entertainmentRoute);
router.use("/living", livingRoute);
router.use("/course", course);
router.use("/products", productsRoute);

module.exports = router;
