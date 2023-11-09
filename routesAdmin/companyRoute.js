var express = require("express");
var router = express.Router();
const companyController = require("../controllersAdmin/companyController");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const { checker } = require("../middleware/bodyChecker");

router.get("/", function (req, res, next) {
	res.send("respond with a company");
});

router.post(
	"/addCompany",
	[
		check("name").notEmpty().withMessage(Messages.NAME_REQUIRED),
		check("salaryRange").notEmpty().withMessage(Messages.SALARY_RANGE_REQUIRED),
	],
	checker,
	isAuthAdmin,
	companyController.addCompany
);

router.get(
	"/getAllCompaniesList",
	isAuthAdmin,
	companyController.getAllCompaniesList
);

router.get(
	"/getCompanyDetailsById",
	isAuthAdmin,
	companyController.getCompanyDetailsById
);

router.put(
	"/updateSalaryRangeSelector",
	[
		check("id").notEmpty().withMessage(Messages._ID_REQUIRED),
		check("status").notEmpty().withMessage(Messages.STATUS_REQUIRED),
	],
	checker,
	isAuthAdmin,
	companyController.updateSalaryRangeSelector
);

router.post(
	"/addIndustryAndSkills",
	[
		check("name").notEmpty().withMessage(Messages.NAME_REQUIRED),
		check("type").notEmpty().withMessage(Messages.TYPE_REQUIRED),
	],
	checker,
	isAuthAdmin,
	companyController.addIndustryAndSkills
);

router.get(
	"/getAllIndustryAndSkillsByType",
	isAuthAdmin,
	companyController.getAllIndustryAndSkillsByType
);

module.exports = router;
