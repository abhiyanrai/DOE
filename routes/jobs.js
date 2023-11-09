var express = require("express");
var router = express.Router();
var jobsController = require("../controllers/jobs");
const isAuthUser = require("../middleware/isAuthUser");
const { checker } = require("../middleware/bodyChecker");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");

router.get("/", function (req, res, next) {
	res.send("respond with a saved jobs");
});

router.get("/getUserSavedJobs", isAuthUser, jobsController.getUserSavedJobs);

router.post(
	"/addSavedJob",
	[
		check("jobId").notEmpty().withMessage(Messages.JOB_ID_REQUIRED),
		check("companyId").notEmpty().withMessage(Messages.COMPANY_ID_REQUIRED),
	],
	checker,
	isAuthUser,
	jobsController.addSavedJob
);

router.get(
	"/getAllJobListByUser",
	isAuthUser,
	jobsController.getAllJobListByUser
);

router.get("/getJobDetailsById", isAuthUser, jobsController.getJobDetailsById);

router.get(
	"/getAllMyAppliedJobs",
	isAuthUser,
	jobsController.getAllMyAppliedJobs
);

router.post(
	"/applyForJob",
	[
		check("jobId").notEmpty().withMessage(Messages.JOB_ID_REQUIRED),
		check("companyId").notEmpty().withMessage(Messages.COMPANY_ID_REQUIRED),
		check("resume").notEmpty().withMessage(Messages.RESUME_REQUIRED),
		check("city").notEmpty().withMessage(Messages.CITY_REQUIRED),
	],
	checker,
	isAuthUser,
	jobsController.applyForJob
);

router.get("/getAllSimilarJobs", isAuthUser, jobsController.getAllSimilarJobs);

router.get(
	"/getAllRecentsJobPosts",
	isAuthUser,
	jobsController.getAllRecentsJobPosts
);

router.post(
	"/addJobSearch",
	isAuthUser,
	check("title").notEmpty().withMessage(Messages.TITLE_REQUIRED),
	checker,
	jobsController.addJobSearch
);

router.get("/getAllJobSearches", isAuthUser, jobsController.getAllJobSearches);

router.get(
	"/getAppliedJobDetailsById",
	isAuthUser,
	jobsController.getAppliedJobDetailsById
);

module.exports = router;
