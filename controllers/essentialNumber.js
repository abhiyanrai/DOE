const { Messages } = require("../utils/constant");
const { essentialNumbers } = require("../models/essentialNumbers");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data, totalCount) => {
	res.status(resStatus).json({ status, message, data, totalCount });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

// get all user essential numbers ************************************************

exports.getAllUserEssentialNumbers = async (req, res, next) => {
	try {
		const getAllAdminData = await essentialNumbers
			.find({
				isPhoneActive: true,
				addedBy: "Admin",
			})
			.sort({ createdAt: -1 });

		const getAllUserData = await essentialNumbers
			.find({
				isPhoneActive: true,
				userId: req.userId,
			})
			.sort({ createdAt: 1 });

		return getResponse(res, 200, 1, Messages.ESSENTIAL_NUMBER_ADDED, {
			admin: getAllAdminData,
			users: getAllUserData,
		}, getAllAdminData.length + getAllUserData.length);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// add essential numbers ************************************************

exports.addUserEssentialNumbers = async (req, res, next) => {
	try {
		const { name, phone, logo } = req.body;
		const isNumberExist = await essentialNumbers.findOne({
			phone: phone,
			isPhoneActive: true,
			userId: req.userId,
		});
		if (isNumberExist == null) {
			const addEssentialNumbers = new essentialNumbers({
				name,
				phone,
				logo,
				isPhoneActive: true,
				userId: req.userId,
			});
			await addEssentialNumbers.save();
			return getResponse(res, 200, 1, Messages.ESSENTIAL_NUMBER_ADDED, "");
		} else {
			return getResponse(res, 409, 0, Messages.ESSENTIAL_NUMBER_ALREADY, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// update essential numbers ************************************************

exports.updateUserEssentialNumbers = async (req, res, next) => {
	try {
		const { _id, name, phone, logo } = req.body;
		const isNumberExist = await essentialNumbers.findOne({
			_id: _id,
			isPhoneActive: true,
			userId: req.userId,
		});
		if (isNumberExist) {	
			if (name) {
				isNumberExist.name = name;
			}

			if (phone) {
				isNumberExist.phone = phone;
			}

			if (logo && logo != "null") {
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

exports.deleteUserEssentialNumbers = async (req, res, next) => {
	try {
		const { _id } = req.query;
		const isNumberExist = await essentialNumbers.findOne({
			_id: _id,
			isPhoneActive: true,
			userId: req.userId,
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
