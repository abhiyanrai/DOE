const { Messages } = require("../utils/constant");
const { myDocuments } = require("../models/myDocuments");
const { officesAndEmbassies } = require("../modelsAdmin/officesAndEmbassies");
const { listOfDocuments } = require("../models/listOfDocuments");
const { applicationForm } = require("../modelsAdmin/applicatioForm");
const { documentRenewal } = require("../models/documentRenewal");
const moment = require("moment");
const { customListOfDocuments } = require("../models/customListOfDocuments");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

// add my document  ************************************************

exports.addMyDocuments = async (req, res, next) => {
	try {
		const { docName, imageLogo } = req.body;

		const findDoc = await myDocuments.findOne({
			docName: docName,
			isActive: true,
			userId: req.userId,
		});
		if (!findDoc) {
			const addDocu = new myDocuments({
				docName,
				imageLogo,
				isActive: true,
				userId: req.userId,
			});
			await addDocu.save();
			return getResponse(res, 200, 1, Messages.DOC_ADDED, "");
		} else {
			return getResponse(res, 409, 0, Messages.ALREADY_EXIST, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// get all my document **********************************************

exports.getAllMyDocuments = async (req, res, next) => {
	try {
		const findMyDocuments = await myDocuments
			.find({
				isActive: true,
				userId: req.userId,
			})
			.sort({ createdAt: -1 });

		const findMyDefaultDocuments = await myDocuments
			.find({
				isActive: true,
				userId: "",
			})
			.sort({ createdAt: -1 });

		const findMyDocumentsMapData = findMyDocuments.map((e) => {
			const obj = JSON.parse(JSON.stringify(e));
			obj.timeDuration = moment(obj.createdAt).format("DD-MM-YYYY");
			return obj;
		});

		const findMyDefaultDocumentsMapData = findMyDefaultDocuments.map((e) => {
			const obj = JSON.parse(JSON.stringify(e));
			obj.timeDuration = moment(obj.createdAt).format("DD-MM-YYYY");
			return obj;
		});

		return getResponse(res, 200, 1, Messages.DOC_DATA, {
			defaultDocumentLength: findMyDefaultDocumentsMapData.length,
			myDocumentsLength: findMyDocumentsMapData.length,
			defaultDocument: findMyDefaultDocumentsMapData,
			myDocuments: findMyDocumentsMapData,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// get all district officesAndEmbassies ************************************************

exports.getAllofficesAndEmbassiesById = async (req, res, next) => {
	try {
		const { id } = req.query;

		const isExist = await officesAndEmbassies
			.find({
				isActive: true,
				myDocumentId: id,
			})
			.sort({ createdAt: -1 });

		if (isExist.length > 0) {
			let arr = [];
			const findDoc = await myDocuments.findById({
				_id: id,
			});
			const findApplicationForm = await applicationForm.findOne({
				myDocumentId: id,
				isActive: true,
			});
			for (let index = 0; index < isExist.length; index++) {
				const element = JSON.parse(JSON.stringify(isExist[index]));
				element.documnetData = findDoc;
				element.applicationFormData = findApplicationForm;
				arr.push(element);
			}
			return res.status(200).json({
				status: 1,
				message: Messages.GET_DISTRICT,
				totalLength: arr.length,
				data: arr,
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: Messages.DATA_NOT_FOUND,
				totalLength: 0,
				data: [],
			});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// add list of documents ************************************************

exports.addListOfDocuments = async (req, res, next) => {
	try {
		const {
			passportImage,
			workPermitImage,
			registrationBookImage,
			marriageCertificationImage,
			residencyBookImage,
			birthCertificatonImage,
			myDocumentId,
		} = req.body;

		const { userId } = req;

		if (
			!passportImage &&
			!workPermitImage &&
			!registrationBookImage &&
			!marriageCertificationImage &&
			!residencyBookImage &&
			!birthCertificatonImage
		) {
			return getResponse(res, 400, 0, Messages.VALID_DATA_PROVIDE, "");
		}
		const findDoc = await listOfDocuments.find({
			isActive: true,
			userId: userId,
			myDocumentId: myDocumentId,
		});

		if (findDoc.length != 0) {
			return getResponse(res, 409, 0, Messages.ALREADY_EXIST, {});
		} else {
			const addDocu = new listOfDocuments({
				passportImage,
				workPermitImage,
				registrationBookImage,
				marriageCertificationImage,
				residencyBookImage,
				birthCertificatonImage,
				isActive: true,
				userId: userId,
				myDocumentId: myDocumentId,
			});

			await addDocu.save();
			return getResponse(res, 200, 1, Messages.DOC_ADDED, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// get all list of documents by id ************************************************

exports.getAllListOfDocumentsById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const { userId } = req;

		const listDocData = await listOfDocuments
			.findOne({
				myDocumentId: id,
				isActive: true,
				userId: userId,
			})
			.sort({ createdAt: -1 });

		const element = JSON.parse(JSON.stringify(listDocData));

		if (element) {
			const findDoc = await myDocuments.findById({
				_id: element?.myDocumentId,
				userId: userId,
			});
			element.documnetData = findDoc;
		}

		return getResponse(
			res,
			200,
			1,
			Messages.DOC_DATA_LIST,
			element ? element : {}
		);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateListOfDocumentsById = async (req, res, next) => {
	try {
		const {
			passportImage,
			workPermitImage,
			registrationBookImage,
			marriageCertificationImage,
			residencyBookImage,
			birthCertificatonImage,
			myDocumentId,
		} = req.body;

		const { userId } = req;

		const listDocData = await listOfDocuments.findOne({
			myDocumentId: myDocumentId,
			isActive: true,
			userId: userId,
		});

		if (listDocData) {
			if (passportImage) {
				listDocData.passportImage = passportImage;
			}

			if (workPermitImage) {
				listDocData.workPermitImage = workPermitImage;
			}

			if (registrationBookImage) {
				listDocData.registrationBookImage = registrationBookImage;
			}

			if (marriageCertificationImage) {
				listDocData.marriageCertificationImage = marriageCertificationImage;
			}

			if (residencyBookImage) {
				listDocData.residencyBookImage = residencyBookImage;
			}

			if (birthCertificatonImage) {
				listDocData.birthCertificatonImage = birthCertificatonImage;
			}

			listDocData.save();
			return getResponse(res, 200, 1, Messages.DOC_DATA_UPDATED, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteListOfDocumentsById = async (req, res, next) => {
	try {
		const { myDocumentId } = req.query;

		const { userId } = req;

		const listDocData = await listOfDocuments.findOne({
			myDocumentId: myDocumentId,
			isActive: true,
			userId: userId,
		});

		if (listDocData) {
			listDocData.isActive = false;
			listDocData.save();
			return getResponse(res, 200, 1, Messages.DOC_DATA_DELETED, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// get application form ************************************************

exports.getApplicationFormByDocumentId = async (req, res, next) => {
	try {
		const { id } = req.query;

		const findDocuments = await myDocuments.findOne({
			_id: id,
			isActive: true,
		});

		if (findDocuments) {
			const isExist = await applicationForm.findOne({
				myDocumentId: id,
				isActive: true,
			});

			if (isExist) {
				return res.status(200).json({
					status: 1,
					message: Messages.APPLICATION_FORM,
					totalLength: 1,
					data: isExist,
				});
				// return getResponse(res, 200, 1, Messages.APPLICATION_FORM, isExist);
			} else {
				return res.status(200).json({
					status: 0,
					message: Messages.DATA_NOT_FOUND,
					totalLength: 0,
					data: {},
				});
				// return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
			}
		} else {
			return getResponse(res, 400, 0, Messages.DOC_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// add renewal *******************************************************

exports.addRenewal = async (req, res, next) => {
	try {
		const {
			myDocumentId,
			notificationText,
			issueDate,
			expiryDate,
			otherDescription,
			reminder,
		} = req.body;
		const { userId } = req;
		const findUserRenewal = await documentRenewal.findOne({
			userId: userId,
			myDocumentId: myDocumentId,
			isActive: true,
		});
		if (!findUserRenewal) {
			const addDocumentRenewal = await documentRenewal.create({
				notificationText,
				issueDate,
				expiryDate,
				otherDescription,
				reminder,
				userId: userId,
				myDocumentId: myDocumentId,
			});
			if (addDocumentRenewal) {
				return getResponse(
					res,
					200,
					1,
					Messages.RENEWAL_ADD,
					addDocumentRenewal
				);
			} else {
				return getResponse(res, 500, 0, Messages.SOMETHING_WENT_WRONG, "");
			}
		} else {
			return getResponse(res, 409, 0, Messages.RENEWAL_ALREAY_EXITS, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// get renewal data ************************************************

exports.getRenewalByMyDocumentId = async (req, res, next) => {
	try {
		const { id } = req.query;
		const { userId } = req;

		const findDocuments = await myDocuments.findOne({
			_id: id,
			isActive: true,
		});

		if (findDocuments) {
			const isExist = await documentRenewal.find({
				myDocumentId: id,
				userId: userId,
			});

			if (isExist) {
				return getResponse(res, 200, 1, Messages.RENEWAL_DATA, isExist);
			} else {
				return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
			}
		} else {
			return getResponse(res, 409, 0, Messages.DOC_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllDocumentsImage = (req, res) => {
	try {
		const arr = [
			{ name: "1", docImage: "logos/Group 8067@3x.png" },
			{ name: "2", docImage: "logos/Group 8069@3x.png" },
			{ name: "3", docImage: "logos/Group 8071@3x.png" },
			{ name: "4", docImage: "logos/Group 8080@3x.png" },
			{ name: "5", docImage: "logos/Group 8073@3x.png" },
			{ name: "6", docImage: "logos/Group 8065@3x.png" },
		];
		return getResponse(res, 200, 1, Messages.DATA_FETCHED, arr);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addCustomListOfDocuments = async (req, res, next) => {
	try {
		const { myDocumentId, docUrl } = req.body;
		const { userId } = req;

		const addCustomDocument = await customListOfDocuments.create({
			docUrl,
			userId: userId,
			myDocumentId: myDocumentId,
		});
		if (addCustomDocument) {
			return getResponse(
				res,
				200,
				1,
				Messages.CUSTOM_DOC_ADD,
				addCustomDocument
			);
		} else {
			return getResponse(res, 500, 0, Messages.SOMETHING_WENT_WRONG, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllCustomListOfDocumentsByDocId = async (req, res, next) => {
	try {
		const { myDocumentId } = req.query;
		const { userId } = req;

		const findCustomDocument = await customListOfDocuments
			.find({
				userId: userId,
				myDocumentId: myDocumentId,
				isActive: true,
			})
			.sort({ createdAt: -1 });

		if (findCustomDocument) {
			return getResponse(
				res,
				200,
				1,
				Messages.DOC_DATA_LIST,
				findCustomDocument
			);
		} else {
			return getResponse(res, 500, 0, Messages.SOMETHING_WENT_WRONG, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteCustomListOfDocumentsById = async (req, res, next) => {
	try {
		const { myDocumentId, id } = req.query;

		const { userId } = req;

		const listDocData = await customListOfDocuments.findOne({
			_id: id,
			myDocumentId: myDocumentId,
			isActive: true,
			userId: userId,
		});

		if (listDocData) {
			listDocData.isActive = false;
			listDocData.save();
			return getResponse(res, 200, 1, Messages.DOC_DATA_DELETED, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
