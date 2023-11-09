const { news } = require("../models/news");
const { newsViews } = require("../models/newsViews");
const { Messages } = require("../utils/constant");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.addNewAndArticle = async (req, res, next) => {
	try {
		const {
			newsTitle,
			newsHeading,
			publishDate,
			newsContent,
			publishBy,
			type,
			thumbnail,
			video,
			isBanner,
			isPublished,
			onPriority,
			videoTimeDuration,
		} = req.body;

		const findNewsAndArticle = await news.find({
			newsTitle: newsTitle,
			isActive: true,
		});
		if (findNewsAndArticle.length > 0) {
			return getResponse(res, 400, 0, Messages.NEWS_ALREDY_EXIST, {});
		} else {
			const addnews = await news.create({
				newsTitle,
				newsHeading,
				publishDate,
				newsContent,
				publishBy,
				type,
				thumbnail,
				video,
				isBanner,
				isPublished,
				onPriority,
				videoTimeDuration,
			});

			if (addnews) {
				return getResponse(res, 200, 1, Messages.NEWS_ADDED, addnews);
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

exports.getAllNews = async (req, res, next) => {
	try {
		const { search, page, limit, type } = req.query;

		const skip = limit * page - limit;

		let findNews = [];

		let totalLength = 0;

		if (type) {
			totalLength = await news
				.find({
					newsTitle: { $regex: search, $options: "i" },
					isActive: true,
					type: type,
				})
				.sort({ createdAt: -1 });

			findNews = await news
				.find({
					newsTitle: { $regex: search, $options: "i" },
					isActive: true,
					type: type,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 });
		} else {
			totalLength = await news
				.find({
					newsTitle: { $regex: search, $options: "i" },
					isActive: true,
				})
				.sort({ createdAt: -1 });

			findNews = await news
				.find({
					newsTitle: { $regex: search, $options: "i" },
					isActive: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 });
		}

		let arr = [];

		for (let index = 0; index < findNews.length; index++) {
			const element = JSON.parse(JSON.stringify(findNews[index]));
			const findViews = await newsViews.find({
				newsId: element._id,
				isActive: true,
			});
			element.viewCount = findViews.length;
			arr.push(element);
		}

		return res.status(200).json({
			status: 1,
			message: Messages.NEWS_FETCHED,
			totalData: totalLength.length,
			data: arr,
		});
		// return getResponse(res, 200, 1, Messages.NEWS_FETCHED, arr);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getNewsDetailsById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const findNews = await news.find({
			_id: id,
			isActive: true,
		});

		if (findNews.length > 0) {
			let obj = JSON.parse(JSON.stringify(findNews[0]));
			const findViews = await newsViews.find({
				newsId: obj._id,
				isActive: true,
			});
			obj.viewCount = findViews.length;
			return getResponse(res, 200, 1, Messages.NEWS_FETCHED, obj);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateNewsById = async (req, res, next) => {
	try {
		const {
			id,
			newsTitle,
			newsHeading,
			publishDate,
			newsContent,
			publishBy,
			type,
			thumbnail,
			video,
			onPriority,
			newsSource,
			isBanner,
			isPublished,
			videoTimeDuration,
		} = req.body;
		const findNews = await news.findOne({
			_id: id,
			isActive: true,
		});

		if (findNews) {
			if (newsTitle) {
				findNews.newsTitle = newsTitle;
			}

			if (newsHeading) {
				findNews.newsHeading = newsHeading;
			}

			if (publishDate) {
				findNews.publishDate = publishDate;
			}

			if (newsContent) {
				findNews.newsContent = newsContent;
			}

			if (publishBy) {
				findNews.publishBy = publishBy;
			}
			if (type) {
				findNews.type = type;
			}
			if (thumbnail) {
				findNews.thumbnail = thumbnail;
			}

			if (video) {
				findNews.video = video;
			}

			if (newsSource) {
				findNews.newsSource = newsSource;
			}

			if (onPriority) {
				findNews.onPriority = onPriority;
			}

			if (isPublished) {
				findNews.isPublished = isPublished;
			}
			if (isBanner) {
				findNews.isBanner = isBanner;
			}

			if (videoTimeDuration) {
				findNews.videoTimeDuration = videoTimeDuration;
			}

			findNews.save();

			return getResponse(res, 200, 1, Messages.NEWS_UPDATED, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteNewsById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const findNews = await news.findOne({
			_id: id,
			isActive: true,
		});

		if (findNews) {
			findNews.isActive = false;
			findNews.save();

			return getResponse(res, 200, 1, Messages.NEWS_DELETED, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.publishOrUnpublish = async (req, res, next) => {
	try {
		const { id, status } = req.body;
		const findNews = await news.findOne({
			_id: id,
			isActive: true,
		});

		if (findNews) {
			findNews.isPublished = status;
			findNews.save();

			return getResponse(
				res,
				200,
				1,
				status ? Messages.NEWS_Published : Messages.NEWS_UnPublished,
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

exports.updatePriority = async (req, res, next) => {
	try {
		const { id, status } = req.body;
		const findNews = await news.findOne({
			_id: id,
			isActive: true,
		});

		if (findNews) {
			findNews.onPriority = status;
			findNews.save();

			return getResponse(
				res,
				200,
				1,
				status ? Messages.NEWS_Priority : Messages.NEWS_UnPriority,
				""
			);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: newsController.js:258 ~ exports.updatePriority= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.bannerOnOff = async (req, res, next) => {
	try {
		const { id, status } = req.body;
		const findNews = await news.findOne({
			_id: id,
			isActive: true,
		});

		if (findNews) {
			findNews.isBanner = status;
			findNews.save();

			return getResponse(res, 200, 1, Messages.NEWS_BANNER_UPDATE, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
