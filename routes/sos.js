var express = require("express");
var router = express.Router();
var sosController = require("../controllers/sos");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthUser = require("../middleware/isAuthUser");

const { checker } = require("../middleware/bodyChecker");

// add sos *********************************************************

router.post(
	"/addSosByUser",
	[
		check("text").notEmpty().withMessage(Messages.TEXT_REQUIRED),
		check("sosMessagesId").notEmpty().withMessage(Messages.SOS_ID_REQUIRED),
	],
	checker,
	isAuthUser,
	sosController.addSosByUser
);

// add sos message ******************************************************

router.post(
	"/addSosMessageByUser",
	check("name").notEmpty().withMessage(Messages.NAME_REQUIRED),
	checker,
	isAuthUser,
	sosController.addSosMessageByUser
);

// get all sos message ******************************************************

router.get(
	"/getAllSosMessagesByUser",
	isAuthUser,
	sosController.getAllSosMessagesByUser
);

router.put(
	"/updateUserSosMessages",
	check("_id").notEmpty().withMessage(Messages._ID_REQUIRED),
	checker,
	isAuthUser,
	sosController.updateUserSosMessages
);

router.delete(
	"/deleteUserSosMessages",
	isAuthUser,
	sosController.deleteUserSosMessages
);

module.exports = router;
