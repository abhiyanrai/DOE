var express = require("express");
var router = express.Router();
var essentialController = require("../controllers/essentialNumber");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthUser = require("../middleware/isAuthUser");

const { checker } = require("../middleware/bodyChecker");

/* GET users listing. */
router.get("/", function (req, res, next) {
	res.send("respond with a resource");
});

// get all essential number *************************************************

router.get(
	"/getAllUserEssentialNumbers",
	isAuthUser,
	essentialController.getAllUserEssentialNumbers
);

// add essential number *************************************************

router.post(
	"/addUserEssentialNumbers",
	isAuthUser,
	[
		check("name").notEmpty().withMessage(Messages.NAME_REQUIRED),
		check("phone").notEmpty().withMessage(Messages.PHONE_NUMBER_REQUIRED),
	],
	checker,
	essentialController.addUserEssentialNumbers
);

// update essential number *************************************************

router.put(
	"/updateUserEssentialNumbers",
	check("_id").notEmpty().withMessage(Messages._ID_REQUIRED),
	checker,
	isAuthUser,
	essentialController.updateUserEssentialNumbers
);

// delete essential number *************************************************

router.delete(
	"/deleteUserEssentialNumbers",
	check("_id").notEmpty().withMessage(Messages._ID_REQUIRED),
	checker,
	isAuthUser,
	essentialController.deleteUserEssentialNumbers
);

module.exports = router;
