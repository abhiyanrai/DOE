const { entertainment } = require("../models/entertainment");
const { Messages } = require("../utils/constant");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.addVideosAndInshorts = async (req, res, next) => {
	try {
		const {
			title,
			subtitle,
			content,
			contentSource,
			type,
			publishDate,
			thumbnail,
			video,
			isBanner,
			isPublish,
			videoTimeDuration,
		} = req.body;

		const findVideosAndInshorts = await entertainment.find({
			title: title,
			isActive: true,
		});
		if (findVideosAndInshorts.length > 0) {
			return getResponse(res, 400, 0, Messages.ALREADY_EXIST, {});
		} else {
			const addVideosAndInshorts = await entertainment.create({
				title,
				subtitle,
				content,
				contentSource,
				type,
				publishDate,
				thumbnail,
				video,
				isBanner,
				isPublish,
				videoTimeDuration,
			});

			if (addVideosAndInshorts) {
				return getResponse(
					res,
					200,
					1,
					Messages.VIDEOS_AND_INSHORTS_ADDED,
					addVideosAndInshorts
				);
			} else {
				return getError(res, 500, {
					status: 0,
					message: Messages.SOMETHING_WENT_WRONG,
				});
			}
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllVideoAndInshorts = async (req, res, next) => {
	try {
		const { search, page, limit, type } = req.query;

		const skip = limit * page - limit;

		let findVideoAndInshorts = [];
		let totalLength = 0;
		if (type) {
			totalLength = await entertainment
				.find({
					title: { $regex: search, $options: "i" },
					isActive: true,
					type: type,
				})
				.sort({ createdAt: -1 });

			findVideoAndInshorts = await entertainment
				.find({
					title: { $regex: search, $options: "i" },
					isActive: true,
					type: type,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 });
		} else {
			totalLength = await entertainment
				.find({
					title: { $regex: search, $options: "i" },
					isActive: true,
				})
				.sort({ createdAt: -1 });

			findVideoAndInshorts = await entertainment
				.find({
					title: { $regex: search, $options: "i" },
					isActive: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 });
		}

		let arr = [];

		for (let index = 0; index < findVideoAndInshorts.length; index++) {
			const element = JSON.parse(JSON.stringify(findVideoAndInshorts[index]));
			// const findViews = await newsViews.find({
			// 	newsId: element._id,
			// 	isActive: true,
			// });
			// element.viewCount = findViews.length;
			arr.push(element);
		}

		return res.status(200).json({
			status: 1,
			message: Messages.VIDEO_INSHORTS_FETCHED,
			totalData: totalLength.length,
			data: arr,
		});
		// return getResponse(res, 200, 1, Messages.VIDEO_INSHORTS_FETCHED, arr);
	} catch (error) {
		console.log(
			"🚀 ~ file: entertainmentController.js:115 ~ exports.getAllVideoAndInshorts= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getVideoAndInshortsDetailsById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const findVideoAndInshorts = await entertainment.find({
			_id: id,
			isActive: true,
		});

		if (findVideoAndInshorts.length > 0) {
			let obj = JSON.parse(JSON.stringify(findVideoAndInshorts[0]));
			// const findViews = await newsViews.find({
			// 	newsId: obj._id,
			// 	isActive: true,
			// });
			// obj.viewCount = findViews.length;
			return getResponse(res, 200, 1, Messages.VIDEO_INSHORTS_FETCHED, obj);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateVideoAndInshortsById = async (req, res, next) => {
	try {
		const {
			id,
			title,
			subtitle,
			content,
			contentSource,
			creatorName,
			type,
			publishDate,
			thumbnail,
			video,
			isBanner,
			isPublish,
			videoTimeDuration,
		} = req.body;

		const findVideoAndInshort = await entertainment.findOne({
			_id: id,
			isActive: true,
		});

		if (findVideoAndInshort) {
			if (title) {
				findVideoAndInshort.title = title;
			}

			if (subtitle) {
				findVideoAndInshort.subtitle = subtitle;
			}

			if (publishDate) {
				findVideoAndInshort.publishDate = publishDate;
			}

			if (content) {
				findVideoAndInshort.content = content;
			}

			if (contentSource) {
				findVideoAndInshort.contentSource = contentSource;
			}
			if (type) {
				findVideoAndInshort.type = type;
			}
			if (thumbnail) {
				findVideoAndInshort.thumbnail = thumbnail;
			}

			if (video) {
				findVideoAndInshort.video = video;
			}

			if (creatorName) {
				findVideoAndInshort.creatorName = creatorName;
			}

			if (isPublish) {
				findVideoAndInshort.isPublish = isPublish;
			}
			if (isBanner) {
				findVideoAndInshort.isBanner = isBanner;
			}

			if (videoTimeDuration) {
				findVideoAndInshort.videoTimeDuration = videoTimeDuration;
			}

			findVideoAndInshort.save();

			return getResponse(res, 200, 1, Messages.VIDEO_INSHORTS_UPDATED, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteVideoAndInshortsById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const findVideoAndInshort = await entertainment.findOne({
			_id: id,
			isActive: true,
		});

		if (findVideoAndInshort) {
			findVideoAndInshort.isActive = false;
			findVideoAndInshort.save();

			return getResponse(res, 200, 1, Messages.Video_Inshort_DELETED, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.publishOrUnpublishVideoAndInshorts = async (req, res, next) => {
	try {
		const { id, status } = req.body;
		const findEntertainment = await entertainment.findOne({
			_id: id,
			isActive: true,
		});

		if (findEntertainment) {
			findEntertainment.isPublish = status;
			findEntertainment.save();

			return getResponse(
				res,
				200,
				1,
				status ? Messages.VIDEO_Published : Messages.VIDEO_unPublished,
				""
			);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.bannerOnOffVideoAndInshorts = async (req, res, next) => {
	try {
		const { id, status } = req.body;
		const findNews = await entertainment.findOne({
			_id: id,
			isActive: true,
		});

		if (findNews) {
			findNews.isBanner = status;
			findNews.save();

			return getResponse(res, 200, 1, Messages._BANNER_UPDATE, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
