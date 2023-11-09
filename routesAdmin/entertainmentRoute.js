var express = require("express");
var router = express.Router();
const entertainmentController = require("../controllersAdmin/entertainmentController");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const { checker } = require("../middleware/bodyChecker");

router.get("/", function (req, res, next) {
	res.send("respond with a entertainmenet");
});

router.post(
	"/addVideosAndInshorts",
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
	entertainmentController.addVideosAndInshorts
);

router.get(
	"/getAllVideoAndInshorts",
	isAuthAdmin,
	entertainmentController.getAllVideoAndInshorts
);

router.get(
	"/getVideoAndInshortsDetailsById",
	isAuthAdmin,
	entertainmentController.getVideoAndInshortsDetailsById
);

router.put(
	"/updateVideoAndInshortsById",
	isAuthAdmin,
	entertainmentController.updateVideoAndInshortsById
);

router.delete(
	"/deleteVideoAndInshortsById",
	isAuthAdmin,
	entertainmentController.deleteVideoAndInshortsById
);

router.put(
	"/publishOrUnpublishVideoAndInshorts",
	isAuthAdmin,
	entertainmentController.publishOrUnpublishVideoAndInshorts
);

router.put(
	"/bannerOnOffVideoAndInshorts",
	isAuthAdmin,
	entertainmentController.bannerOnOffVideoAndInshorts
);

module.exports = router;
