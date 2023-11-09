var express = require("express");
var router = express.Router();
const usersRouter = require("./usersRoute");
const essentialRouter = require("./essentialNumberRoute");
const mapRouter = require("./mapRoute");
const sosRouter = require("./SosRoute");
const documentRouter = require("./documentRoute");
const jobsRoute = require("./jobsRoute");
const companyRoute = require("./companyRoute");
const reviewRoute = require("./reviewRoute");
const newRoute = require("./newsRoute");
const entertainmentRoute = require("./entertainmentRoute");
const livingRoute = require("./livingRoute");
const courseRoute = require("./courseRoute");
const shopRoute = require("./shopRoute")
const productRoute = require("./productRoute")

router.use("/", usersRouter);
router.use("/map", mapRouter);
router.use("/essentialNumber", essentialRouter);
router.use("/sos", sosRouter);
router.use("/documents", documentRouter);
router.use("/jobs", jobsRoute);
router.use("/company", companyRoute);
router.use("/reviews", reviewRoute);
router.use("/newsAndArticle", newRoute);
router.use("/entertainment", entertainmentRoute);
router.use("/living", livingRoute);
router.use("/courses", courseRoute);
router.use("/shops", shopRoute)
router.use("/products", productRoute)

module.exports = router;
