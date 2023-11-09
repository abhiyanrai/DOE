const { map } = require("../models/map");
const { Messages } = require("../utils/constant");
const { findPlacesByTextQuery } = require("../utils/functions");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

// addMapData ********************************************************

exports.addMapData = async (req, res, next) => {
	try {
		const { name, status, address, image, latitude, longitude, isPinned } =
			req.body;

		const isMapExist = await map.findOne({ name, isActive: true });
		if (isMapExist) {
			return getResponse(res, 409, 0, Messages.ALREADY_EXIST, {});
		} else {
			const addMap = new map({
				name,
				status,
				address,
				image,
				latitude,
				longitude,
				userId: "",
				isPinned,
			});
			await addMap.save();
			return getResponse(res, 200, 1, Messages.MAP_ADDED, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// getMapData ********************************************************

exports.getMapData = async (req, res, next) => {
	try {
		const { type, search, page, limit } = req.query;
		const skip = limit * page - limit;

		let typeCheck = type == "Official" ? "Official" : "touristAttraction";

		const findDataLength = await map.find({
			name: { $regex: search, $options: "i" },
			isActive: true,
			status: typeCheck,
		});

		const isMapExist = await map
			.find({
				name: { $regex: search, $options: "i" },
				isActive: true,
				status: typeCheck,
			})
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		if (isMapExist.length == 0) {
			let findGoogleMapData = await findPlacesByTextQuery(search);
			if (findGoogleMapData.length > 0) {
				const mapData = await findGoogleMapData.map((item) => {
					return {
						name: item?.name,
						address: item.formatted_address,
						latitude: item?.geometry?.location?.lat.toString(),
						longitude: item?.geometry?.location?.lng.toString(),
					};
				});

				return res.status(200).json({
					status: 1,
					message: Messages.MAP_DATA_FETCHED,
					totalLength: mapData.length,
					data: mapData,
				});
			}

			return res.status(200).json({
				status: 0,
				message: Messages.DATA_NOT_FOUND,
				totalLength: findDataLength.length,
				data: [],
			});
		} else {
			return res.status(200).json({
				status: 1,
				message: Messages.MAP_DATA_FETCHED,
				totalLength: findDataLength.length,
				data: isMapExist,
			});
		}
	} catch (error) {
		console.log("🚀 ~ file: map.js:55 ~ exports.getMapData= ~ error:", error);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getMapDataBySearch = async (req, res, next) => {
	try {
		const { type, search, page, limit } = req.query;
		const skip = limit * page - limit;

		let typeCheck = type == "Official" ? "Official" : "touristAttraction";

		const findDataLength = await map.find({
			name: { $regex: search, $options: "i" },
			isActive: true,
			status: typeCheck,
		});

		const isMapExist = await map
			.find({
				name: { $regex: search, $options: "i" },
				isActive: true,
				status: typeCheck,
			})
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		if (isMapExist.length == 0) {
			return res.status(200).json({
				status: 0,
				message: Messages.DATA_NOT_FOUND,
				totalLength: findDataLength.length,
				data: [],
			});
		} else {
			return res.status(200).json({
				status: 1,
				message: Messages.MAP_DATA_FETCHED,
				totalLength: findDataLength.length,
				data: isMapExist,
			});
		}
	} catch (error) {
		console.log("🚀 ~ file: map.js:55 ~ exports.getMapData= ~ error:", error);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// updateMapData ************************************************

exports.updateMapData = async (req, res, next) => {
	try {
		const { id, name, status, address, image, latitude, longitude, isPinned } =
			req.body;
		const isMapExist = await map.findOne({ _id: id, isActive: true });
		if (isMapExist) {
			let params = {};

			if (name) {
				params.name = name;
			}

			if (status) {
				params.status = status;
			}

			if (address) {
				params.address = address;
			}

			if (image) {
				params.image = image;
			}

			if (latitude) {
				params.latitude = latitude;
			}

			if (longitude) {
				params.longitude = longitude;
			}

			if (isPinned) {
				params.isPinned = isPinned;
			}

			const updateMapData = await map.updateMany(
				{ _id: id, isActive: true },
				params
			);

			if (updateMapData) {
				return getResponse(res, 200, 1, Messages.MAP_UPDATE, "");
			} else {
				return getResponse(res, 500, 0, Messages.SOMETHING_WENT_WRONG, "");
			}
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// deleteMapData ************************************************

exports.deleteMapDataById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const isMapExist = await map.findOne({ _id: id, isActive: true });

		if (isMapExist) {
			const deleteMapData = await map.updateMany(
				{ _id: id, isActive: true },
				{ isActive: false }
			);

			if (deleteMapData) {
				return getResponse(res, 200, 1, Messages.MAP_DELETE, "");
			} else {
				return getResponse(res, 500, 0, Messages.SOMETHING_WENT_WRONG, "");
			}
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// getMapDataDetailsById ********************************************************

exports.getMapDataDetailsById = async (req, res, next) => {
	try {
		const { id } = req.query;

		const isMapExist = await map.find({
			_id: id,
			isActive: true,
		});

		if (isMapExist.length == 0) {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		} else {
			return getResponse(res, 200, 1, Messages.MAP_DATA_FETCHED, isMapExist);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
