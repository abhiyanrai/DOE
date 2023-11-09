var express = require("express");
var router = express.Router();
const adminController = require("../controllersAdmin/usersController");
const { body, check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const isAuthOtp = require("../middleware/isAuthOtp");
const { checker } = require("../middleware/bodyChecker");

// Admin Signup ***************************************

router.post(
	"/signup",
	[
		check("email").notEmpty().withMessage(Messages.EMAIL_REQUIRED),
		check("password").notEmpty().withMessage(Messages.PASSWORD_REQUIRED),
	],
	checker,
	adminController.signUpAdmin
);

// Admin Sign In ********************************************

router.post(
	"/signIn",
	[
		check("email").notEmpty().withMessage(Messages.EMAIL_REQUIRED),
		check("password").notEmpty().withMessage(Messages.PASSWORD_REQUIRED),
	],
	checker,
	adminController.signInAdmin
);

// Admin Details ************************************************

router.get("/getAdminDetails", isAuthAdmin, adminController.getAdminDetails);

// update Profile *************************************************

router.put("/updateProfile", isAuthAdmin, adminController.updateProfile);

// forget password *************************************************

router.post(
	"/forgetPassword",
	body("email").custom((value) => {
		if (/\S+@\S+\.\S+/.test(value)) {
			return Promise.resolve(); // valid email
		} else {
			return Promise.reject(Messages.INVALID_EMAIL);
		}
	}),
	checker,
	adminController.forgetPassword
);

// reset password *************************************************

router.put(
	"/resetPassword",
	check("password").notEmpty().withMessage(Messages.PASSWORD_REQUIRED),
	checker,
	isAuthOtp,
	adminController.resetPassword
);

// get all users *************************************************

router.get("/getAllUser", isAuthAdmin, adminController.getAllUser);

// otp verification *************************************************

router.put(
	"/otpVerification",
	[
		check("otp").notEmpty().withMessage(Messages.OTP_REQUIRED),
		check("email").notEmpty().withMessage(Messages.EMAIL_REQUIRED),
	],
	checker,
	adminController.otpVerification
);

// Admin list ************************************************

router.get(
	"/getAllAdminDetails",
	isAuthAdmin,
	adminController.getAllAdminDetails
);

router.delete("/deleteAdminById", isAuthAdmin, adminController.deleteAdminById);


// Vendor List *************************************************

router.get(
	"/getAllVendorDetails", 
	isAuthAdmin,
	adminController.getAllVendorDetails
)

module.exports = router;
