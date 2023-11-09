var express = require("express");
var router = express.Router();
const livingController = require("../controllersAdmin/livingController");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const { checker } = require("../middleware/bodyChecker");

router.get("/", function (req, res, next) {
	res.send("respond with a living");
});

router.post(
	"/addVideosAndArticles",
	[
		check("title").notEmpty().withMessage(Messages.TITLE_REQUIRED),
		check("subtitle").notEmpty().withMessage(Messages.SUBTITLE_REQUIRED),
		check("content").notEmpty().withMessage(Messages.CONTENT_REQUIRED),
		check("contentSource")
			.notEmpty()
			.withMessage(Messages.CONTENT_SOURCE_REQUIRED),
		check("type").notEmpty().withMessage(Messages.PUBLISH_BY_REQUIRED),
		check("publishDate").notEmpty().withMessage(Messages.TYPE_REQUIRED),
	],
	checker,
	isAuthAdmin,
	livingController.addVideosAndArticles
);

router.get(
	"/getAllVideoAndArticles",
	isAuthAdmin,
	livingController.getAllVideoAndArticles
);

router.get(
	"/getVideoAndArticlesDetailsById",
	isAuthAdmin,
	livingController.getVideoAndArticlesDetailsById
);

router.put(
	"/updateVideoAndArticlesById",
	isAuthAdmin,
	livingController.updateVideoAndArticlesById
);

router.delete(
	"/deleteVideoAndArticlesById",
	isAuthAdmin,
	livingController.deleteVideoAndArticlesById
);

router.put(
	"/changeIsPopularVideoAndArticles",
	isAuthAdmin,
	livingController.changeIsPopularVideoAndArticles
);

router.put(
	"/bannerOnOffVideoAndArticles",
	isAuthAdmin,
	livingController.bannerOnOffVideoAndArticles
);

router.put(
	"/publishOrUnpublishVideoAndArticles",
	isAuthAdmin,
	livingController.publishOrUnpublishVideoAndArticles
);

module.exports = router;
