var express = require("express");
var router = express.Router();
var docController = require("../controllers/document");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthUser = require("../middleware/isAuthUser");
const { checker } = require("../middleware/bodyChecker");

/* GET users listing. */
router.get("/", function (req, res, next) {
	res.send("respond with a resource");
});

// add my documnets *********************************************************

router.post(
	"/addMyDocuments",
	check("docName").notEmpty().withMessage(Messages.DOC_NAME_REQUIRED),
	checker,
	isAuthUser,
	docController.addMyDocuments
);

// get All my document *****************************************************

router.get("/getAllMyDocuments", isAuthUser, docController.getAllMyDocuments);

// add list of documents *********************************************************

router.post(
	"/addListOfDocuments",
	[
		// check("passportImage").notEmpty().withMessage(Messages.PASSPORT_REQUIRED),
		// check("workPermitImage").notEmpty().withMessage(Messages.PERMIT_REQUIRED),
		// check("registrationBookImage")
		// 	.notEmpty()
		// 	.withMessage(Messages.REGISTRATION_REQUIRED),
		// check("marriageCertificationImage")
		// 	.notEmpty()
		// 	.withMessage(Messages.MARRIAGE_REQUIRED),
		// check("residencyBookImage")
		// 	.notEmpty()
		// 	.withMessage(Messages.RESIDENCY_REQUIRED),
		// check("birthCertificatonImage")
		// 	.notEmpty()
		// 	.withMessage(Messages.BIRTH_REQUIRED),
		check("myDocumentId").notEmpty().withMessage(Messages.MY_DOC_ID),
	],
	checker,
	isAuthUser,
	docController.addListOfDocuments
);

// get all list of documents *********************************************************

router.get(
	"/getAllListOfDocumentsById",
	isAuthUser,
	docController.getAllListOfDocumentsById
);

// get application form by id user*************************************************

router.get(
	"/getApplicationFormByDocumentId",
	isAuthUser,
	docController.getApplicationFormByDocumentId
);

// add renewwal *************************************************

router.post(
	"/addRenewal",
	[
		check("myDocumentId").notEmpty().withMessage(Messages.MY_DOC_ID),
		check("notificationText")
			.notEmpty()
			.withMessage(Messages.NOTIFICATION_TEXT_REQUIRED),
		check("issueDate").notEmpty().withMessage(Messages.ISSUE_DATE_REQUIRED),
		check("expiryDate").notEmpty().withMessage(Messages.EXPIRY_DATE_REQUIRED),
		check("otherDescription")
			.notEmpty()
			.withMessage(Messages.OTHER_DESC_REQUIRED),
		check("reminder").notEmpty().withMessage(Messages.REMINDER_REQUIRED),
	],
	checker,
	isAuthUser,
	docController.addRenewal
);

// get renewal by my document id

router.get(
	"/getRenewalByMyDocumentId",
	isAuthUser,
	docController.getRenewalByMyDocumentId
);

// get district officesAndEmbassies *************************************************

router.get(
	"/getAllofficesAndEmbassiesById",
	docController.getAllofficesAndEmbassiesById
);

router.get(
	"/getAllDocumentsImage",
	isAuthUser,
	docController.getAllDocumentsImage
);

router.put(
	"/updateListOfDocumentsById",
	isAuthUser,
	docController.updateListOfDocumentsById
);

router.delete(
	"/deleteListOfDocumentsById",
	isAuthUser,
	docController.deleteListOfDocumentsById
);

router.post(
	"/addCustomListOfDocuments",
	[
		check("myDocumentId").notEmpty().withMessage(Messages.MY_DOC_ID),
		check("docUrl").notEmpty().withMessage(Messages.DOC_URL_REQUIRED),
	],
	checker,
	isAuthUser,
	docController.addCustomListOfDocuments
);

router.get(
	"/getAllCustomListOfDocumentsByDocId",
	isAuthUser,
	docController.getAllCustomListOfDocumentsByDocId
);

router.delete(
	"/deleteCustomListOfDocumentsById",
	isAuthUser,
	docController.deleteCustomListOfDocumentsById
);

module.exports = router;
