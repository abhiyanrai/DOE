const { living } = require("../models/living");
const { Messages } = require("../utils/constant");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.addVideosAndArticles = async (req, res, next) => {
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
			isPopular,
			isPublish,
			videoTimeDuration,
		} = req.body;

		const findVideosAndArticles = await living.find({
			title: title,
			isActive: true,
		});
		if (findVideosAndArticles.length > 0) {
			return getResponse(res, 400, 0, Messages.ALREADY_EXIST, {});
		} else {
			const addVideosAndArticles = await living.create({
				title,
				subtitle,
				content,
				contentSource,
				type,
				publishDate,
				thumbnail,
				video,
				isBanner,
				isPopular,
				isPublish,
				videoTimeDuration,
			});

			if (addVideosAndArticles) {
				return getResponse(
					res,
					200,
					1,
					Messages.VIDEOS_AND_ARTICLE_ADDED,
					addVideosAndArticles
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

exports.getAllVideoAndArticles = async (req, res, next) => {
	try {
		const { search, page, limit, type } = req.query;

		const skip = limit * page - limit;

		let findVideoAndArticles = [];
		let totalLength = 0;
		if (type) {
			totalLength = await living
				.find({
					title: { $regex: search, $options: "i" },
					isActive: true,
					type: type,
				})
				.sort({ createdAt: -1 });

			findVideoAndArticles = await living
				.find({
					title: { $regex: search, $options: "i" },
					isActive: true,
					type: type,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 });
		} else {
			totalLength = await living
				.find({
					title: { $regex: search, $options: "i" },
					isActive: true,
				})
				.sort({ createdAt: -1 });

			findVideoAndArticles = await living
				.find({
					title: { $regex: search, $options: "i" },
					isActive: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 });
		}

		let arr = [];

		for (let index = 0; index < findVideoAndArticles.length; index++) {
			const element = JSON.parse(JSON.stringify(findVideoAndArticles[index]));
			arr.push(element);
		}

		return res.status(200).json({
			status: 1,
			message: Messages.VIDEOS_AND_ARTICLE_FETCHED,
			totalData: totalLength.length,
			data: arr,
		});
	} catch (error) {
		console.log(
			"🚀 ~ file: livingController.js:115 ~ exports.getAllVideoAndArticles= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getVideoAndArticlesDetailsById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const findVideoAndArticles = await living.find({
			_id: id,
			isActive: true,
		});

		if (findVideoAndArticles.length > 0) {
			let obj = JSON.parse(JSON.stringify(findVideoAndArticles[0]));
			// const findViews = await newsViews.find({
			// 	newsId: obj._id,
			// 	isActive: true,
			// });
			// obj.viewCount = findViews.length;
			return getResponse(res, 200, 1, Messages.VIDEOS_AND_ARTICLE_FETCHED, obj);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateVideoAndArticlesById = async (req, res, next) => {
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
			isPopular,
			isPublish,
			videoTimeDuration,
		} = req.body;

		const findVideoAndInshort = await living.findOne({
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

			if (isPopular) {
				findVideoAndInshort.isPopular = isPopular;
			}
			if (isBanner) {
				findVideoAndInshort.isBanner = isBanner;
			}
			if (isPublish) {
				findVideoAndInshort.isPublish = isPublish;
			}

			if (videoTimeDuration) {
				findVideoAndInshort.videoTimeDuration = videoTimeDuration;
			}

			findVideoAndInshort.save();

			return getResponse(res, 200, 1, Messages.VIDEO_ARTICLE_UPDATED, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteVideoAndArticlesById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const findVideoAndInshort = await living.findOne({
			_id: id,
			isActive: true,
		});

		if (findVideoAndInshort) {
			findVideoAndInshort.isActive = false;
			findVideoAndInshort.save();

			return getResponse(res, 200, 1, Messages.Video_ARTICLE_DELETED, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.changeIsPopularVideoAndArticles = async (req, res, next) => {
	try {
		const { id, status } = req.body;
		const findliving = await living.findOne({
			_id: id,
			isActive: true,
		});

		if (findliving) {
			findliving.isPopular = status;
			findliving.save();

			return getResponse(
				res,
				200,
				1,
				status ? Messages.VIDEO_Populars : Messages.VIDEO_unPopulars,
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

exports.bannerOnOffVideoAndArticles = async (req, res, next) => {
	try {
		const { id, status } = req.body;
		const findNews = await living.findOne({
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

exports.publishOrUnpublishVideoAndArticles = async (req, res, next) => {
	try {
		const { id, status } = req.body;
		const findLiving = await living.findOne({
			_id: id,
			isActive: true,
		});

		if (findLiving) {
			findLiving.isPublish = status;
			findLiving.save();

			return getResponse(
				res,
				200,
				1,
				status
					? Messages.VIDEO_ARTICLE_Published
					: Messages.VIDEO_ARTICLE_unPublished,
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
