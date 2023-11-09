var express = require("express");
var router = express.Router();
var jobController = require("../controllersAdmin/jobController");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const { checker } = require("../middleware/bodyChecker");

/* GET users listing. */
router.get("/", function (req, res, next) {
	res.send("respond with a job");
});

router.post(
	"/addJobs",
	[
		check("title").notEmpty().withMessage(Messages.TITLE_REQUIRED),
		check("companyId").notEmpty().withMessage(Messages.COM_ID_REQUIRED),
		check("workExp").notEmpty().withMessage(Messages.WORK_EXPE_REQUIRED),
		check("employmentType")
			.notEmpty()
			.withMessage(Messages.EMPLOYMET_TYPE_REQUIRED),
		check("skillsRequired").notEmpty().withMessage(Messages.SKILLS_REQUIRED),
		check("noOfPosition")
			.notEmpty()
			.withMessage(Messages.CANDIDATE_NO_REQUIRED),
	],
	checker,
	isAuthAdmin,
	jobController.addJobs
);

router.get("/getJobDetailsById", isAuthAdmin, jobController.getJobDetailsById);

router.delete("/deleteJobById", isAuthAdmin, jobController.deleteJobById);

router.put(
	"/updateJobDetailsById",
	check("id").notEmpty().withMessage(Messages._ID_REQUIRED),
	checker,
	isAuthAdmin,
	jobController.updateJobDetailsById
);

router.get("/getAllJobList", isAuthAdmin, jobController.getAllJobList);

router.put(
	"/updateUserApplicationStatus",
	[
		check("userId").notEmpty().withMessage(Messages.USERID_REQUIRED),
		check("status").notEmpty().withMessage(Messages.STATUS_REQUIRED),
		check("jobId").notEmpty().withMessage(Messages.JOB_ID_REQUIRED),
	],
	checker,
	isAuthAdmin,
	jobController.updateUserApplicationStatus
);

router.put(
	"/updateJobStatus",
	[
		check("status").notEmpty().withMessage(Messages.STATUS_REQUIRED),
		check("jobId").notEmpty().withMessage(Messages.JOB_ID_REQUIRED),
	],
	checker,
	isAuthAdmin,
	jobController.updateJobStatus
);

module.exports = router;
