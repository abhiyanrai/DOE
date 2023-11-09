var express = require("express");
var router = express.Router();
const newsController = require("../controllersAdmin/newsController");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const { checker } = require("../middleware/bodyChecker");

router.get("/", function (req, res, next) {
	res.send("respond with a company");
});

router.post(
	"/addNewAndArticle",
	[
		check("newsTitle").notEmpty().withMessage(Messages.NEWS_TITLE_REQUIRED),
		check("newsHeading").notEmpty().withMessage(Messages.NEWS_HEADING_REQUIRED),
		check("publishDate").notEmpty().withMessage(Messages.PUBLISH_DATE_REQUIRED),
		check("newsContent").notEmpty().withMessage(Messages.NEWS_CONTENT_REQUIRED),
		check("publishBy").notEmpty().withMessage(Messages.PUBLISH_BY_REQUIRED),
		check("type").notEmpty().withMessage(Messages.TYPE_REQUIRED),
	],
	checker,
	isAuthAdmin,
	newsController.addNewAndArticle
);

router.get("/getAllNews", isAuthAdmin, newsController.getAllNews);

router.get(
	"/getNewsDetailsById",
	isAuthAdmin,
	newsController.getNewsDetailsById
);

router.put("/updateNewsById", isAuthAdmin, newsController.updateNewsById);

router.delete("/deleteNewsById", isAuthAdmin, newsController.deleteNewsById);

router.put(
	"/publishOrUnpublish",
	isAuthAdmin,
	newsController.publishOrUnpublish
);

router.put("/updatePriority", isAuthAdmin, newsController.updatePriority);

router.put("/bannerOnOff", isAuthAdmin, newsController.bannerOnOff);

module.exports = router;
