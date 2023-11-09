var express = require("express");
var router = express.Router();
const newsController = require("../controllers/news");
const isAuthUser = require("../middleware/isAuthUser");
const { checker } = require("../middleware/bodyChecker");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");

router.get("/", function (req, res, next) {
	res.send("respond with a news");
});

router.get("/getAllTopNews", isAuthUser, newsController.getAllTopNews);

router.get(
	"/getNewsDetailsById",
	isAuthUser,
	newsController.getNewsDetailsById
);

router.get(
	"/getAllNewsAndArticles",
	isAuthUser,
	newsController.getAllNewsAndArticles
);

router.post(
	"/readNewsOrArticle",
	check("newsId").notEmpty().withMessage(Messages.NEWS_ID_REQUIRED),
	checker,
	isAuthUser,
	newsController.readNewsOrArticle
);

router.get("/getAllSavedNews", isAuthUser, newsController.getAllSavedNews);

router.get(
	"/getAllNewsAndArticlesByType",
	isAuthUser,
	newsController.getAllNewsAndArticlesByType
);

router.get("/getAllBannerNews", isAuthUser, newsController.getAllBannerNews);

router.get(
	"/getAllRecentsPlayedNews",
	isAuthUser,
	newsController.getAllRecentsPlayedNews
);

router.post(
	"/viewNewsVideo",
	check("newsId").notEmpty().withMessage(Messages.NEWS_ID_REQUIRED),
	checker,
	isAuthUser,
	newsController.viewNewsVideo
);

router.post(
	"/addNewsSearch",
	isAuthUser,
	check("title").notEmpty().withMessage(Messages.TITLE_REQUIRED),
	checker,
	newsController.addNewsSearch
);

router.get(
	"/getAllNewsSearches",
	isAuthUser,
	newsController.getAllNewsSearches
);

router.post(
	"/saveUnsaveNewsAndArticle",
	check("newsId").notEmpty().withMessage(Messages.NEWS_ID_REQUIRED),
	checker,
	isAuthUser,
	newsController.saveUnsaveNewsAndArticle
);

module.exports = router;
