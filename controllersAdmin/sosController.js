const { validationResult } = require("express-validator");
const { Messages } = require("../utils/constant");
const { userSos } = require("../models/userSos");
const { sosMessages } = require("../models/sosMessages");
const { UserDetails } = require("../models/userDetails");
const { User } = require("../models/users");
const { limitation } = require("../modelsAdmin/limitation");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

// add sos message ****************************************************

exports.addSosMessageByAdmin = async (req, res, next) => {
	try {
		const { name } = req.body;

		const findAllMessage = await sosMessages.find({
			isActive: true,
			addedBy: "Admin",
		});

		if (findAllMessage.length >= 4) {
			return getResponse(res, 200, 0, Messages.LIMIT_EXCEED, "");
		}

		const isExist = await sosMessages.findOne({
			name: name,
			isActive: true,
		});

		if (!isExist) {
			const addSosMessage = new sosMessages({
				name,
			});
			await addSosMessage.save();
			return getResponse(res, 200, 1, Messages.MESSAGE_ADD, "");
		} else {
			return getResponse(res, 409, 0, Messages.ALREADY_EXIST, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// get all sos ************************************************

exports.getAllUserSos = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;
		const skip = limit * page - limit;

		const getAllDataLength = await userSos.find({ isActive: true });

		const getAllData = await userSos
			.find({ isActive: true })
			.skip(skip)
			.limit(limit)
			.sort({ updatedAt: -1 });

		let arr = [];
		for (let index = 0; index < getAllData.length; index++) {
			const element = JSON.parse(JSON.stringify(getAllData[index]));
			const findUser = await User.find({ _id: element.userId, isActive: true });
			let data = JSON.parse(JSON.stringify(findUser));
			if (data.length > 0) {
				const userProfile = await UserDetails.findOne({
					userId: element.userId,
				});

				if (userProfile) {
					data[0].profile = userProfile.profile;
				}

				delete data[0].password;
				element.userDetails = data;
				arr.push(element);
			}
		}

		const filterData = arr.filter(
			(item) =>
				item?.userDetails[0]?.email.indexOf(search) !== -1 ||
				item?.userDetails[0]?.name.indexOf(search) !== -1
		);

		return res.status(200).json({
			status: 1,
			message: Messages.SOS_DATA,
			totalData: getAllDataLength.length,
			currentPage: page ? page : 1,
			data: filterData,
		});
	} catch (error) {
		console.log(
			"🚀 ~ file: sosController.js:92 ~ exports.getAllUserSos= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getSosMessagesById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const findUserSos = await sosMessages.find({
			_id: id,
			isActive: true,
		});

		if (findUserSos.length > 0) {
			let data = JSON.parse(JSON.stringify(findUserSos));

			return getResponse(res, 200, 1, Messages.SOS_DATA, data);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateSosMessagesById = async (req, res, next) => {
	try {
		const { id, name, sosMessagesId } = req.body;
		const findUserSoS = await sosMessages.findOne({
			_id: id,
			isActive: true,
		});

		if (findUserSoS) {
			if (name) {
				findUserSoS.name = name;
			}

			if (sosMessagesId) {
				findUserSoS.sosMessagesId = sosMessagesId;
			}

			findUserSoS.save();

			return getResponse(res, 200, 1, Messages.SOS_UPDATED, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteSosMessagesById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const findUserSos = await sosMessages.findOne({
			_id: id,
			isActive: true,
		});

		if (findUserSos) {
			findUserSos.isActive = false;
			findUserSos.save();

			return getResponse(res, 200, 1, Messages.SOS_DELETE, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllSosMessagesByAdmin = async (req, res, next) => {
	try {
		const adminSOS = await sosMessages
			.find({
				isActive: true,
				userId: "",
			})
			.sort({ createdAt: -1 });

		return res.status(200).json({
			status: 1,
			message: Messages.GET_DATA,
			totalData: adminSOS.length,
			data: adminSOS,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.setSosLimitation = async (req, res, next) => {
	try {
		const { limit } = req.body;

		const findSosLimit = await limitation.findOne({
			module: "sos",
			isActive: true,
		});

		if (findSosLimit) {
			findSosLimit.limit = limit;
			findSosLimit.save();

			return res.status(200).json({
				status: 1,
				message: Messages.SOS_LIMIT_UPDATE,
				data: findSosLimit,
			});
		} else {
			const addSOSlimit = await limitation.create({
				module: "sos",
				limit: limit,
			});
			if (addSOSlimit) {
				return res.status(200).json({
					status: 1,
					message: Messages.SOS_LIMIT_ADDED,
					data: addSOSlimit,
				});
			} else {
				return res
					.status(500)
					.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
			}
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getSosLimitation = async (req, res, next) => {
	try {
		const findSosLimit = await limitation.findOne({
			module: "sos",
			isActive: true,
		});

		if (findSosLimit) {
			return res.status(200).json({
				status: 1,
				message: Messages.SOS_LIMIT_UPDATE,
				data: findSosLimit,
			});
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
