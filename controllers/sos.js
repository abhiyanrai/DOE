const { Messages } = require("../utils/constant");
const { userSos } = require("../models/userSos");
const { sosMessages } = require("../models/sosMessages");
const moment = require("moment");
const { limitation } = require("../modelsAdmin/limitation");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

// add sos  ************************************************

exports.addSosByUser = async (req, res, next) => {
	try {
		const { text, sosMessagesId } = req.body;
		const { userId } = req;

		const findUserSos = await userSos.find({
			isActive: true,
			userId: userId,
			createdAt: {
				$gte: moment(new Date()).format().split("T")[0] + "T00:00:00+05:30",
				$lt: moment(new Date()).format().split("T")[0] + "T23:59:59+05:30",
			},
		});

		const findSosLimit = await limitation.findOne({
			module: "sos",
			isActive: true,
		});

		if (findSosLimit) {
			if (findUserSos.length >= findSosLimit.limit) {
				return getResponse(
					res,
					200,
					0,
					`${Messages.LIMIT_EXCEED_USER} ${findSosLimit.limit} SOS`,
					""
				);
			}
		}

		const addSos = new userSos({
			text,
			isActive: true,
			userId: userId,
			sosMessagesId,
		});

		await addSos.save();
		return getResponse(res, 200, 1, Messages.SOS_ADDED, "");
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// add sos message by user ****************************************************

exports.addSosMessageByUser = async (req, res, next) => {
	try {
		const { name } = req.body;
		const { userId } = req;
		const isExist = await sosMessages.findOne({
			name: name,
			isActive: true,
		});

		if (!isExist) {
			const addSosMessage = new sosMessages({
				name,
				userId: userId,
				addedBy: "User",
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

// get all sos message by user ****************************************************

exports.getAllSosMessagesByUser = async (req, res, next) => {
	try {
		const { userId } = req;

		const adminSOS = await sosMessages
			.find({
				isActive: true,
				userId: "",
			})
			.sort({ createdAt: -1 });

		const userSOS = await sosMessages
			.find({
				isActive: true,
				userId: userId,
			})
			.sort({ createdAt: -1 });

		let combineArr = [...adminSOS, ...userSOS];
		return res.status(200).json({
			status: 1,
			message: Messages.GET_DATA,
			totalDataUser: userSOS.length,
			totalDataAdmin: adminSOS.length,
			totalData: combineArr.length,
			data: combineArr,
		});
		// return getResponse(res, 200, 1, Messages.GET_DATA, combineArr);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateUserSosMessages = async (req, res, next) => {
	try {
		const { userId } = req;
		const { _id, name } = req.body;
		const isSosMessageExist = await sosMessages.findOne({
			_id: _id,
			isActive: true,
			userId: userId,
		});
		if (isSosMessageExist) {
			if (name) {
				isSosMessageExist.name = name;
			}

			await isSosMessageExist.save();
			return getResponse(res, 200, 1, Messages.SOS_MESSAGE_UPDATE, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteUserSosMessages = async (req, res, next) => {
	try {
		const { id } = req.query;
		const { userId } = req;

		const isSOSExist = await sosMessages.findOne({
			_id: id,
			isActive: true,
			userId: userId,
		});
		if (isSOSExist) {
			isSOSExist.isActive = false;
			await isSOSExist.save();

			return getResponse(res, 200, 1, Messages.SOS_MESSAGE_DELETE, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
