var express = require("express");
var router = express.Router();
const mapController = require("../controllersAdmin/mapController");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const { checker } = require("../middleware/bodyChecker");
const isAuthAdmin = require("../middleware/isAuthAdmin");

// add map data ***************************************

router.post(
	"/addMapData",
	[
		check("name").notEmpty().withMessage(Messages.NAME_REQUIRED),
		check("address").notEmpty().withMessage(Messages.ADDRESS_REQUIRED),
		check("status").notEmpty().withMessage(Messages.STATUS_REQUIRED),
		check("latitude").notEmpty().withMessage(Messages.LATITUDE_REQUIRED),
		check("longitude").notEmpty().withMessage(Messages.LONGITUDE_REQUIRED),
	],
	checker,
	isAuthAdmin,
	mapController.addMapData
);

// get map data ***************************************

router.get("/getMapData", isAuthAdmin, mapController.getMapData);

// update map data ***************************************

router.put(
	"/updateMapData",
	check("id").notEmpty().withMessage(Messages._ID_REQUIRED),
	checker,
	isAuthAdmin,
	mapController.updateMapData
);

// delete map data ***************************************

router.delete(
	"/deleteMapDataById",
	isAuthAdmin,
	mapController.deleteMapDataById
);

// getMapDataDetailsById ***************************************

router.get(
	"/getMapDataDetailsById",
	isAuthAdmin,
	mapController.getMapDataDetailsById
);

router.get("/getMapDataBySearch", isAuthAdmin, mapController.getMapDataBySearch);

module.exports = router;
