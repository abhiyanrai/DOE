var express = require("express");
var router = express.Router();
var userController = require("../controllers/users");
const { body, check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthUser = require("../middleware/isAuthUser");
const isAuthOtp = require("../middleware/isAuthOtp");
const { checker } = require("../middleware/bodyChecker");
const fileUpload = require("../middleware/fileUpload");

/* GET users listing. */
router.get("/", function (req, res, next) {
	res.send("respond with a resource");
});

// Signup *****************************************

router.post("/signUp", userController.signUp);

// login ************************************************

router.post("/signIn", userController.signIn);

// user Details ************************************************

router.get("/getUserDetails", isAuthUser, userController.getUserDetails);

// update user Profile *************************************************

router.put("/updateUserProfile", isAuthUser, userController.updateUserProfile);

// forget Password *************************************************

router.post("/forgetPassword", userController.forgetPassword);

// file upload *************************************************

router.post("/fileUpload", fileUpload, userController.fileUpload);



router.post("/multipleFileUpload", fileUpload, userController.multipleFileUpload);

// reset password *************************************************

router.put(
	"/resetPassword",
	check("password").notEmpty().withMessage(Messages.PASSWORD_REQUIRED),
	checker,
	isAuthOtp,
	userController.resetPassword
);

// otp verification *************************************************

router.put(
	"/otpVerification",
	[
		check("otp").notEmpty().withMessage(Messages.OTP_REQUIRED),
		check("email").notEmpty().withMessage(Messages.EMAIL_REQUIRED),
	],
	checker,
	userController.otpVerification
);

// update device token *************************************************

router.put(
	"/updateDeviceToken",
	[check("token").notEmpty().withMessage(Messages.TOKEN_REQUIRED)],
	checker,
	isAuthUser,
	userController.updateDeviceToken
);

module.exports = router;
