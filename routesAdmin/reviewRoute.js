var express = require("express");
var router = express.Router();
const reviewController = require("../controllersAdmin/reviewController");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const { checker } = require("../middleware/bodyChecker");

router.get("/", function (req, res, next) {
	res.send("respond with a company");
});

router.post(
	"/addReviewAndRating",
	[
		check("name").notEmpty().withMessage(Messages.NAME_REQUIRED),
		check("rating").notEmpty().withMessage(Messages.RATING_REQUIRED),
		check("companyId").notEmpty().withMessage(Messages.COMPANY_ID_REQUIRED),
		check("review").notEmpty().withMessage(Messages.REVIEW_REQUIRED),
		check("jobId").notEmpty().withMessage(Messages.JOB_ID_REQUIRED),
	],
	checker,
	isAuthAdmin,
	reviewController.addReviewAndRating
);

router.get(
	"/getAllReviewsByJobId",
	isAuthAdmin,
	reviewController.getAllReviewsByJobId
);

router.get(
	"/getReviewsDetailsById",
	isAuthAdmin,
	reviewController.getReviewsDetailsById
);

router.put("/updateReviewById", isAuthAdmin, reviewController.updateReviewById);

router.delete(
	"/deleteReviewById",
	isAuthAdmin,
	reviewController.deleteReviewById
);

module.exports = router;
