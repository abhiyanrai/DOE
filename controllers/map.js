const { Messages } = require("../utils/constant");
const { map } = require("../models/map");
const {
	findPlacesByTextQuery,
	findNavigateDataByLatLong,
} = require("../utils/functions");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

// getMapDataByUser ********************************************************

exports.getMapDataByUser = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;

		const skip = limit * page - limit;

		const query = {
			name: { $regex: search, $options: "i" },
			isActive: true,
			isPinned: true,
		};

		const [isMapExist, isMapExistLength] = await Promise.all([
			map.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
			map.countDocuments(query),
		]);

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
				totalLength: isMapExistLength.length,
				data: [],
			});
		} else {
			return res.status(200).json({
				status: 1,
				message: Messages.MAP_DATA_FETCHED,
				totalLength: isMapExistLength.length,
				data: isMapExist,
			});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// getMapDataByTYpe ********************************************************

exports.getMapDataByType = async (req, res, next) => {
	try {
		const { type, search, page, limit } = req.query;
		const skip = limit * page - limit;

		const isMapExist = await map
			.find({
				name: { $regex: search, $options: "i" },
				status: type,
				isActive: true,
				isPinned: true,
			})
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		if (isMapExist.length == 0) {
			let findGoogleMapData = await findPlacesByTextQuery(search);
			if (findGoogleMapData.length > 0) {
				const mapData = await findGoogleMapData.map((item) => {
					return {
						_id: "",
						name: item?.name,
						address: item.formatted_address,
						latitude: item?.geometry?.location?.lat.toString(),
						longitude: item?.geometry?.location?.lng.toString(),
					};
				});

				return res.status(200).json({
					status: 1,
					message: Messages.MAP_DATA_FETCHED,
					data: mapData,
				});
			}
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		} else {
			return getResponse(res, 200, 1, Messages.MAP_DATA_FETCHED, isMapExist);
		}
	} catch (error) {
		console.log("🚀 ~ file: map.js:55 ~ exports.getMapData= ~ error:", error);
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
			isPinned: true,
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

// addMapDataByUser ********************************************************

exports.addMapDataByUser = async (req, res, next) => {
	try {
		const { name, address, image, latitude, longitude } = req.body;

		const { userId } = req;

		const isMapExist = await map.findOne({
			name,
			userId: userId,
			isActive: true,
		});
		if (isMapExist) {
			return getResponse(res, 409, 0, Messages.ALREADY_EXIST, {});
		} else {
			const addMap = new map({
				name,
				status: "Personal",
				address,
				image,
				latitude,
				longitude,
				userId: userId,
				isPinned: true,
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

exports.getMapNavigateData = async (req, res, next) => {
	try {
		const { lat1, long1, lat2, long2 } = req.query;

		const navData = await findNavigateDataByLatLong(lat1, long1, lat2, long2);

		if (!navData) {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		} else {
			return getResponse(res, 200, 1, Messages.MAP_DATA_FETCHED, {
				routes: navData,
			});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
