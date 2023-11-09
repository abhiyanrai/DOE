const { validationResult } = require("express-validator");
const { Messages } = require("../utils/constant");
const { essentialNumbers } = require("../models/essentialNumbers");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

// add essential numbers ************************************************

exports.addEssentialNumbers = async (req, res, next) => {
	try {
		const { name, phone, logo } = req.body;
		const isNumberExist = await essentialNumbers.findOne({
			phone: phone,
			isPhoneActive: true,
			addedBy: "Admin",
		});
		if (isNumberExist == null) {
			const addEssentialNumbers = new essentialNumbers({
				name,
				phone,
				logo,
				isPhoneActive: true,
				addedBy: "Admin",
			});
			await addEssentialNumbers.save();
			return getResponse(res, 200, 1, Messages.ESSENTIAL_NUMBER_ADDED, "");
		} else {
			return getResponse(res, 200, 0, Messages.ESSENTIAL_NUMBER_ALREADY, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// update essential numbers ************************************************

exports.updateEssentialNumbers = async (req, res, next) => {
	try {
		const { _id, name, phone, logo } = req.body;
		const isNumberExist = await essentialNumbers.findOne({
			_id: _id,
			isPhoneActive: true,
			addedBy: "Admin",
		});
		if (isNumberExist) {
			if (name) {
				isNumberExist.name = name;
			}

			if (phone) {
				// const isNumberExist2 = await essentialNumbers.findOne({
				// 	phone: phone,
				// 	isPhoneActive: true,
				// });
				// if (isNumberExist2) {
				// 	return getResponse(
				// 		res,
				// 		200,
				// 		0,
				// 		Messages.ESSENTIAL_NUMBER_ALREADY,
				// 		""
				// 	);
				// }
				isNumberExist.phone = phone;
			}

			if (logo) {
				isNumberExist.logo = logo;
			}

			await isNumberExist.save();
			return getResponse(res, 200, 1, Messages.UPDATE_ESSENTIAL_NUMBER, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// delete essential numbers ************************************************

exports.deleteEssentialNumbers = async (req, res, next) => {
	try {
		const { _id } = req.body;
		const isNumberExist = await essentialNumbers.findOne({
			_id: _id,
			isPhoneActive: true,
		});
		if (isNumberExist) {
			isNumberExist.isPhoneActive = false;
			await isNumberExist.save();
			return getResponse(res, 200, 1, Messages.DELETE_ESSENTIAL_NUMBER, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// get all essential numbers ************************************************

exports.getAllEssentialNumbers = async (req, res, next) => {
	try {
		const { name, page, limit } = req.query;

		const skip = limit * page - limit;

		const getAllData = await essentialNumbers.find({
			isPhoneActive: true,
			userId: "",
		});

		const getAllDataBySeach = await essentialNumbers
			.find({
				name: { $regex: name, $options: "i" },
				userId: "",
				isPhoneActive: true,
			})
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		if (getAllDataBySeach.length > 0) {
			return res.status(200).json({
				status: 1,
				message: Messages.GET_ESSENTIAL_NUMBER,
				totalData: getAllData.length,
				currentPage: page ? page : 1,
				data: getAllDataBySeach,
			});
		} else {
			return res.status(200).json({
				status: 0,
				message: Messages.DATA_NOT_FOUND,
				totalData: getAllData.length,
				currentPage: page ? page : 1,
				data: [],
			});
			// return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
