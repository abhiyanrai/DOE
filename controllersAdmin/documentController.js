const { validationResult } = require("express-validator");
const { Messages } = require("../utils/constant");
const { officesAndEmbassies } = require("../modelsAdmin/officesAndEmbassies");
const { myDocuments } = require("../models/myDocuments");
const { applicationForm } = require("../modelsAdmin/applicatioForm");
const { listOfDocuments } = require("../models/listOfDocuments");
const { User } = require("../models/users");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

// add district officesAndEmbassies ************************************************

exports.addofficesAndEmbassies = async (req, res, next) => {
	try {
		const { name, address, imageLogo, myDocumentId } = req.body;

		const isExist = await officesAndEmbassies.findOne({
			name: name,
			isActive: true,
			myDocumentId: myDocumentId,
		});

		if (!isExist) {
			const addofficesAndEmbassies = new officesAndEmbassies({
				name,
				address,
				imageLogo,
				isActive: true,
				myDocumentId: myDocumentId,
			});
			await addofficesAndEmbassies.save();
			return getResponse(
				res,
				200,
				1,
				Messages.ADD_DISTRICT,
				addofficesAndEmbassies
			);
		} else {
			return getResponse(res, 409, 0, Messages.ALREADY_EXIST, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// get all document **********************************************

exports.getAllDocuments = async (req, res, next) => {
	try {
		const { page, limit } = req.query;
		const skip = limit * page - limit;

		const findAllDocuments = await myDocuments.find({
			isActive: true,
			userId: "",
		});

		const findDocuments = await myDocuments
			.find({
				isActive: true,
				userId: "",
			})
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		if (findDocuments.length > 0) {
			let arr = [];
			for (let index = 0; index < findDocuments.length; index++) {
				const element = JSON.parse(JSON.stringify(findDocuments[index]));
				const officesAndEmbassiesData = await officesAndEmbassies.find({
					myDocumentId: element._id,
					isActive: true,
				});
				const findApplicationForm = await applicationForm.findOne({
					myDocumentId: element._id,
					isActive: true,
				});
				const findAllAppliedDocuments = await listOfDocuments.find(
					{
						myDocumentId: element._id,
						isActive: true,
					},
					{ userId: 1 }
				);

				const map = findAllAppliedDocuments.map((e) => e.userId);

				const findAllUsers = await User.find(
					{ _id: { $in: map } },
					{
						_id: 1,
						email: 1,
						name: 1,
						gender: 1,
						isActive: 1,
						createdAt: 1,
						updatedAt: 1,
					}
				);
				element.userDetails = findAllUsers;
				element.applicationForm = findApplicationForm
					? findApplicationForm
					: {};
				element.officesAndEmbassiesData = officesAndEmbassiesData;
				arr.push(element);
			}
			return res.status(200).json({
				status: 1,
				message: Messages.DOC_DATA_LIST,
				totalData: findAllDocuments.length,
				currentPage: page ? page : 1,
				data: arr,
			});
			// return getResponse(res, 200, 1, Messages.DOC_DATA_LIST, arr);
		} else {
			return res.status(200).json({
				status: 0,
				message: Messages.DATA_NOT_FOUND,
				totalData: findAllDocuments.length,
				currentPage: page ? page : 1,
				data: [],
			});
			// return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: documentController.js:129 ~ exports.getAllDocuments= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// add application form ************************************************

exports.addApplicationForm = async (req, res, next) => {
	try {
		const { name, formLink, myDocumentId } = req.body;

		const findDocuments = await myDocuments.findOne({
			_id: myDocumentId,
			isActive: true,
		});
		if (findDocuments) {
			const isExist = await applicationForm.findOne({
				myDocumentId: myDocumentId,
				isActive: true,
			});

			if (!isExist) {
				const addApplicationForm = new applicationForm({
					name,
					formLink,
					isActive: true,
					myDocumentId: myDocumentId,
				});
				await addApplicationForm.save();
				return getResponse(
					res,
					200,
					1,
					Messages.APPLICATION_FORM,
					addApplicationForm
				);
			} else {
				isExist.formLink = formLink;
				isExist.name = name;
				isExist.myDocumentId = myDocumentId;
				isExist.save();
				return getResponse(
					res,
					200,
					1,
					Messages.APPLICATION_FORM_UPDATE,
					isExist
				);
			}
		} else {
			return getResponse(res, 200, 0, Messages.DOC_NOT_FOUND, {});
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
				return getResponse(res, 200, 1, Messages.APPLICATION_FORM, isExist);
			} else {
				return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
			}
		} else {
			return getResponse(res, 200, 0, Messages.DOC_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addDocByAdmin = async (req, res, next) => {
	try {
		const { docName, imageLogo } = req.body;

		const findDoc = await myDocuments.findOne({
			docName: docName,
			isActive: true,
		});
		if (!findDoc) {
			const addDocu = new myDocuments({
				docName,
				imageLogo,
				isActive: true,
				userId: "",
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

exports.updateDocumentByAdmin = async (req, res, next) => {
	try {
		const { docName, imageLogo, id } = req.body;

		const findDoc = await myDocuments.findOne({
			_id: id,
			isActive: true,
		});
		if (findDoc) {
			if (docName) {
				findDoc.docName = docName;
			}

			if (imageLogo) {
				findDoc.imageLogo = imageLogo;
			}

			await findDoc.save();
			return getResponse(res, 200, 1, Messages.DOC_UPDATED, "");
		} else {
			return getResponse(res, 400, 0, Messages.DOC_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteDocumentById = async (req, res, next) => {
	try {
		const { id } = req.query;

		const findDoc = await myDocuments.findOne({
			_id: id,
			isActive: true,
		});
		if (findDoc) {
			findDoc.isActive = false;
			await findDoc.save();
			return getResponse(res, 200, 1, Messages.DOC_DELETED, "");
		} else {
			return getResponse(res, 400, 0, Messages.DOC_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getOfficesAndEmbassiesDetailsById = async (req, res, next) => {
	try {
		const { id, myDocumentId } = req.query;

		const findOfficesAndEmbassiesData = await officesAndEmbassies.find({
			_id: id,
			myDocumentId: myDocumentId,
			isActive: true,
		});

		if (findOfficesAndEmbassiesData.length > 0) {
			return getResponse(
				res,
				200,
				1,
				Messages.OFFICE_DATA,
				findOfficesAndEmbassiesData
			);
		} else {
			return getResponse(res, 400, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateOfficesAndEmbassiesDetailsById = async (req, res, next) => {
	try {
		const { id, myDocumentId, name, address, imageLogo } = req.body;

		const findOfficesAndEmbassiesData = await officesAndEmbassies.findOne({
			_id: id,
			myDocumentId: myDocumentId,
			isActive: true,
		});

		if (findOfficesAndEmbassiesData) {
			if (name) {
				findOfficesAndEmbassiesData.name = name;
			}

			if (address) {
				findOfficesAndEmbassiesData.address = address;
			}

			if (imageLogo) {
				findOfficesAndEmbassiesData.imageLogo = imageLogo;
			}

			findOfficesAndEmbassiesData.save();

			return getResponse(
				res,
				200,
				1,
				Messages.OFFICE_DATA_UPDATED,
				findOfficesAndEmbassiesData
			);
		} else {
			return getResponse(res, 400, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteOfficesAndEmbassiesDetailsById = async (req, res, next) => {
	try {
		const { id, myDocumentId } = req.query;

		const findOfficesAndEmbassiesData = await officesAndEmbassies.findOne({
			_id: id,
			myDocumentId: myDocumentId,
			isActive: true,
		});

		if (findOfficesAndEmbassiesData) {
			findOfficesAndEmbassiesData.isActive = false;
			findOfficesAndEmbassiesData.save();

			return getResponse(res, 200, 1, Messages.OFFICE_DATA_DELETED, "");
		} else {
			return getResponse(res, 400, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllOfficesAndEmbassiesDetailsByDocId = async (req, res, next) => {
	try {
		const { myDocumentId } = req.query;

		const findOfficesAndEmbassiesData = await officesAndEmbassies.find({
			myDocumentId: myDocumentId,
			isActive: true,
		});

		if (findOfficesAndEmbassiesData.length > 0) {
			return getResponse(
				res,
				200,
				1,
				Messages.OFFICE_DATA,
				findOfficesAndEmbassiesData
			);
		} else {
			return getResponse(res, 400, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
