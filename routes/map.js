var express = require("express");
var router = express.Router();
var mapController = require("../controllers/map");
const isAuthUser = require("../middleware/isAuthUser");
const { checker } = require("../middleware/bodyChecker");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");

router.get("/", function (req, res, next) {
	res.send("respond with a map");
});

// getMapDataByUser ***************************************

router.get("/getMapDataByUser", isAuthUser, mapController.getMapDataByUser);

// getMapDataByType ***************************************

router.get("/getMapDataByType", isAuthUser, mapController.getMapDataByType);

// getMapDataDetailsById ***************************************

router.get(
	"/getMapDataDetailsById",
	isAuthUser,
	mapController.getMapDataDetailsById
);

// add map data by user ***************************************

router.post(
	"/addMapDataByUser",
	[
		check("name").notEmpty().withMessage(Messages.NAME_REQUIRED),
		check("address").notEmpty().withMessage(Messages.ADDRESS_REQUIRED),
		check("latitude").notEmpty().withMessage(Messages.LATITUDE_REQUIRED),
		check("longitude").notEmpty().withMessage(Messages.LONGITUDE_REQUIRED),
	],
	checker,
	isAuthUser,
	mapController.addMapDataByUser
);

router.get("/getMapNavigateData", isAuthUser, mapController.getMapNavigateData);

module.exports = router;
