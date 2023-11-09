var express = require("express");
var router = express.Router();
const livingController = require("../controllers/living");
const isAuthUser = require("../middleware/isAuthUser");
const { check } = require("express-validator");
const { checker } = require("../middleware/bodyChecker");
const { Messages } = require("../utils/constant");

router.get("/", function (req, res, next) {
	res.send("respond with a entertainmenet user");
});

router.get("/getAllVideos", isAuthUser, livingController.getAllVideos);

router.get("/getAllArticles", isAuthUser, livingController.getAllArticles);

router.get(
	"/getAllPopularVideos",
	isAuthUser,
	livingController.getAllPopularVideos
);

router.get(
	"/getAllPopularArticles",
	isAuthUser,
	livingController.getAllPopularArticles
);

router.get(
	"/getVideoAndArticlesDetailsById",
	isAuthUser,
	livingController.getVideoAndArticlesDetailsById
);

router.post("/addComment", isAuthUser, livingController.addComment);

router.post(
	"/viewVideoOrArticles",
	check("livingId").notEmpty().withMessage(Messages.LIVING_ID_REQUIRED),
	checker,
	isAuthUser,
	livingController.viewVideoOrArticles
);

router.post(
	"/likeOrUnlike",
	check("livingId").notEmpty().withMessage(Messages.LIVING_ID_REQUIRED),
	checker,
	isAuthUser,
	livingController.likeOrUnlike
);

router.get(
	"/getAllCommentById",
	isAuthUser,
	livingController.getAllCommentById
);

router.post(
	"/savedUnsavedVideoAndArticles",
	[check("livingId").notEmpty().withMessage(Messages.LIVING_ID_REQUIRED)],
	checker,
	isAuthUser,
	livingController.savedUnsavedVideoAndArticles
);

router.get(
	"/getAllUserSavedVideosAndArticles",
	isAuthUser,
	livingController.getAllUserSavedVideosAndArticles
);

router.get(
	"/getAllRecentsPlayedVideoAndArticles",
	isAuthUser,
	livingController.getAllRecentsPlayedVideoAndArticles
);

router.get(
	"/getAllBannerVideosAndArticles",
	isAuthUser,
	livingController.getAllBannerVideosAndArticles
);

router.post(
	"/addLivingRecentSearch",
	isAuthUser,
	livingController.addLivingRecentSearch
);

router.get(
	"/getAllLivingSearches",
	isAuthUser,
	livingController.getAllLivingSearches
);

router.get(
	"/getAllVideosAndArticlesBySearch",
	isAuthUser,
	livingController.getAllVideosAndArticlesBySearch
);

module.exports = router;
