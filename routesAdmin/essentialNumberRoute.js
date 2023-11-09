var express = require("express");
var router = express.Router();
const essentialController = require("../controllersAdmin/essentialController");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const { checker } = require("../middleware/bodyChecker");

// add essential number *************************************************

router.post(
	"/addEssentialNumbers",
	[
		check("name").notEmpty().withMessage(Messages.NAME_REQUIRED),
		check("phone").notEmpty().withMessage(Messages.PHONE_NUMBER_REQUIRED),
	],
	checker,
	isAuthAdmin,
	essentialController.addEssentialNumbers
);

// update essential number *************************************************

router.put(
	"/updateEssentialNumbers",
	check("_id").notEmpty().withMessage(Messages._ID_REQUIRED),
	checker,
	isAuthAdmin,
	essentialController.updateEssentialNumbers
);

// delete essential number *************************************************

router.delete(
	"/deleteEssentialNumbers",
	check("_id").notEmpty().withMessage(Messages._ID_REQUIRED),
	checker,
	isAuthAdmin,
	essentialController.deleteEssentialNumbers
);

// get all essential number *************************************************

router.get(
	"/getAllEssentialNumbers",
	isAuthAdmin,
	essentialController.getAllEssentialNumbers
);

module.exports = router;
