var express = require("express");
var router = express.Router();
const documentController = require("../controllersAdmin/documentController");
const { check } = require("express-validator");
const { Messages } = require("../utils/constant");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const { checker } = require("../middleware/bodyChecker");

// add district officesAndEmbassies *************************************************

router.post(
	"/addofficesAndEmbassies",
	[
		check("name").notEmpty().withMessage(Messages.NAME_REQUIRED),
		check("myDocumentId").notEmpty().withMessage(Messages.myDocumentId),
	],
	checker,
	isAuthAdmin,
	documentController.addofficesAndEmbassies
);

// get All document *****************************************************

router.get("/getAllDocuments", isAuthAdmin, documentController.getAllDocuments);

// add application form *************************************************

router.post(
	"/addApplicationForm",
	[
		check("formLink").notEmpty().withMessage(Messages.FORM_LINK_REQUIRED),
		check("myDocumentId").notEmpty().withMessage(Messages.myDocumentId),
	],
	checker,
	isAuthAdmin,
	documentController.addApplicationForm
);

// get application form by id*************************************************

router.get(
	"/getApplicationFormByDocumentId",
	isAuthAdmin,
	documentController.getApplicationFormByDocumentId
);

// add doc by admin

router.post(
	"/addDocByAdmin",
	check("docName").notEmpty().withMessage(Messages.NAME_REQUIRED),
	checker,
	isAuthAdmin,
	documentController.addDocByAdmin
);

router.put(
	"/updateDocumentByAdmin",
	isAuthAdmin,
	check("id").notEmpty().withMessage(Messages._ID_REQUIRED),
	checker,
	documentController.updateDocumentByAdmin
);

router.delete(
	"/deleteDocumentById",
	isAuthAdmin,
	documentController.deleteDocumentById
);

router.get(
	"/getOfficesAndEmbassiesDetailsById",
	isAuthAdmin,
	documentController.getOfficesAndEmbassiesDetailsById
);

router.put(
	"/updateOfficesAndEmbassiesDetailsById",
	isAuthAdmin,
	documentController.updateOfficesAndEmbassiesDetailsById
);

router.delete(
	"/deleteOfficesAndEmbassiesDetailsById",
	isAuthAdmin,
	documentController.deleteOfficesAndEmbassiesDetailsById
);

router.get(
	"/getAllOfficesAndEmbassiesDetailsByDocId",
	isAuthAdmin,
	documentController.getAllOfficesAndEmbassiesDetailsByDocId
);

module.exports = router;
