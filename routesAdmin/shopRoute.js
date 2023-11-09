const express = require("express");
const shopController = require("../controllersAdmin/shopController");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const { check } = require("express-validator");
const { checker } = require("../middleware/bodyChecker");
const { Messages } = require("../utils/constant");
const router = express.Router();

router.get("/", (req, res, next) => {
	res.send("response from course route");
});

router.post(
	"/createShop",
	isAuthAdmin,
	[
		check("name").notEmpty().withMessage(Messages.SHOP_NAME_REQUIRED),
		check("emailId").notEmpty().withMessage(Messages.SHOP_EMAIL_REQUIRED),
		check("location").notEmpty().withMessage(Messages.SHOP_LOCATION_REQUIRED),
	],
	checker,
	shopController.createShop
);

router.get(
	"/getDetailsByShopId",
	isAuthAdmin,
	shopController.getDetailsByShopId
);

router.put(
	"/updateShopDetails",
	isAuthAdmin,
	check("id").notEmpty().withMessage(Messages.SHOP_ID_REQUIRED),
	checker,
	shopController.updateShopDetails
);

router.delete("/deleteShopById", isAuthAdmin, shopController.deleteShopById);

router.get(
	"/getAllShopsByVendor",
	isAuthAdmin,
	shopController.getAllShopsByVendor
);

module.exports = router;
