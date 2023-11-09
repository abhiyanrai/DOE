var express = require("express");
var router = express.Router();
const sosController = require("../controllersAdmin/sosController");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const { checker } = require("../middleware/bodyChecker");

// add sos message ******************************************************

router.post(
	"/addSosMessageByAdmin",
	check("name").notEmpty().withMessage(Messages.NAME_REQUIRED),
	checker,
	isAuthAdmin,
	sosController.addSosMessageByAdmin
);

// get all sos *************************************************

router.get("/getAllUserSos", isAuthAdmin, sosController.getAllUserSos);

router.get(
	"/getSosMessagesById",
	isAuthAdmin,
	sosController.getSosMessagesById
);

router.put(
	"/updateSosMessagesById",
	isAuthAdmin,
	sosController.updateSosMessagesById
);

router.delete(
	"/deleteSosMessagesById",
	isAuthAdmin,
	sosController.deleteSosMessagesById
);

router.get(
	"/getAllSosMessagesByAdmin",
	isAuthAdmin,
	sosController.getAllSosMessagesByAdmin
);

router.post("/setSosLimitation", isAuthAdmin, sosController.setSosLimitation);

router.get("/getSosLimitation", isAuthAdmin, sosController.getSosLimitation);

module.exports = router;
