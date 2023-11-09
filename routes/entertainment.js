var express = require("express");
var router = express.Router();
const entertainmentController = require("../controllers/entertainment");
const isAuthUser = require("../middleware/isAuthUser");
const { check } = require("express-validator");
const { checker } = require("../middleware/bodyChecker");
const { Messages } = require("../utils/constant");

router.get("/", function (req, res, next) {
	res.send("respond with a entertainmenet user");
});

router.get("/getAllVideos", isAuthUser, entertainmentController.getAllVideos);

router.get(
	"/getAllInshorts",
	isAuthUser,
	entertainmentController.getAllInshorts
);

router.get(
	"/getVideoAndInshortsDetailsById",
	isAuthUser,
	entertainmentController.getVideoAndInshortsDetailsById
);

router.post("/addComment", isAuthUser, entertainmentController.addComment);

router.post(
	"/viewVideoOrInshorts",
	check("entertainmentId")
		.notEmpty()
		.withMessage(Messages.ENTERTAINMENT_ID_REQUIRED),
	checker,
	isAuthUser,
	entertainmentController.viewVideoOrInshorts
);

router.post(
	"/likeOrUnlike",
	check("entertainmentId")
		.notEmpty()
		.withMessage(Messages.ENTERTAINMENT_ID_REQUIRED),
	checker,
	isAuthUser,
	entertainmentController.likeOrUnlike
);

router.get(
	"/getAllCommentById",
	isAuthUser,
	entertainmentController.getAllCommentById
);

router.post(
	"/savedUnsavedVideoAndInshorts",
	[
		check("entertainmentId")
			.notEmpty()
			.withMessage(Messages.ENTERTAINMENT_ID_REQUIRED),
	],
	checker,
	isAuthUser,
	entertainmentController.savedUnsavedVideoAndInshorts
);

router.get(
	"/getAllUserSavedVideosAndInshorts",
	isAuthUser,
	entertainmentController.getAllUserSavedVideosAndInshorts
);

router.get(
	"/getAllRecentsPlayedVideoAndInshorts",
	isAuthUser,
	entertainmentController.getAllRecentsPlayedVideoAndInshorts
);

router.get(
	"/getAllBannerVideosAndInshorts",
	isAuthUser,
	entertainmentController.getAllBannerVideosAndInshorts
);

router.get(
	"/getAllVideosAndInshortsBySearch",
	isAuthUser,
	entertainmentController.getAllVideosAndInshortsBySearch
);

router.post(
	"/addEntertainmentRecentSearch",
	isAuthUser,
	entertainmentController.addEntertainmentRecentSearch
);

router.get(
	"/getAllEntertainmentSearches",
	isAuthUser,
	entertainmentController.getAllEntertainmentSearches
);

router.delete(
	"/deleteCommentByCommentId",
	[
		check("entertainmentId")
			.notEmpty()
			.withMessage(Messages.ENTERTAINMENT_ID_REQUIRED),
		check("commentId").notEmpty().withMessage(Messages.COMMENT_ID_REQUIRED),
	],
	checker,
	isAuthUser,
	entertainmentController.deleteCommentByCommentId
);

module.exports = router;
