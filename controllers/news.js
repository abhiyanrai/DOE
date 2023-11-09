const { news } = require("../models/news");
const { Messages } = require("../utils/constant");
const { userNewsHistory } = require("../models/userNewsHistory");
const { User } = require("../models/users");
const moment = require("moment");
const { newsViews } = require("../models/newsViews");
const { newsRecentSearch } = require("../models/newsRecentSearch");
const { savedNews } = require("../models/savedNews");
const { removeDuplicates } = require("../utils/functions");
const { ObjectId } = require("mongodb");
// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.getAllTopNews = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;

		const { userId } = req;

		const skip = limit * page - limit;

		const [findNewsLength, findNews] = await Promise.all([
			news
				.find({
					newsTitle: { $regex: search, $options: "i" },
					onPriority: true,
					isPublished: true,
					isActive: true,
				})
				.sort({ createdAt: -1 }),
			news
				.find({
					newsTitle: { $regex: search, $options: "i" },
					onPriority: true,
					isPublished: true,
					isActive: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 }),
		]);

		let arr = [];

		const uniqueNewsIds = removeDuplicates(findNews, "_id");

		const findAllSavedNews = await savedNews.find({
			userId: userId,
			isActive: true,
			isSaved: true,
			newsId: { $in: uniqueNewsIds },
		});

		const findAllViews = await newsViews.find({
			newsId: { $in: uniqueNewsIds },
			isActive: true,
		});

		for (let index = 0; index < findNews.length; index++) {
			const element = JSON.parse(JSON.stringify(findNews[index]));
			let publishDateDiff = moment(new Date()).diff(
				new Date(element.publishDate),
				"seconds"
			);

			if (publishDateDiff >= 0) {
				const findSavedNews = findAllSavedNews.find((i) =>
					i.newsId.equals(element._id)
				);
				const findViews = findAllViews.filter((i) =>
					i.newsId.equals(element._id)
				);
				element.postedTime = moment(new Date(element.publishDate)).format(
					"MMM D YYYY"
				);
				element.isSaved = Boolean(findSavedNews);
				element.viewCount = findViews.length;
				arr.push(element);
			}
		}

		return res.status(200).json({
			status: 1,
			message: Messages.NEWS_FETCHED,
			totalLength: findNewsLength.length,
			data: arr,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllNewsAndArticles = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;

		const { userId } = req;

		const skip = limit * page - limit;

		const findNews = await news
			.find({
				newsTitle: { $regex: search, $options: "i" },
				isActive: true,
				isPublished: true,
			})
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		let arr = [];

		const uniqueNewsIds = removeDuplicates(findNews, "_id");

		const findAllSavedNews = await savedNews.find({
			userId: userId,
			isActive: true,
			isSaved: true,
			newsId: { $in: uniqueNewsIds },
		});

		const findAllViews = await newsViews.find({
			newsId: { $in: uniqueNewsIds },
			isActive: true,
		});

		for (let index = 0; index < findNews.length; index++) {
			const element = JSON.parse(JSON.stringify(findNews[index]));

			let publishDateDiff = moment(new Date()).diff(
				new Date(element.publishDate),
				"seconds"
			);

			if (publishDateDiff >= 0) {
				const findSavedNews = findAllSavedNews.find((i) =>
					i.newsId.equals(element._id)
				);
				const findViews = findAllViews.filter((i) =>
					i.newsId.equals(element._id)
				);
				element.postedTime = moment(new Date(element.publishDate)).format(
					"MMM D YYYY"
				);
				element.isSaved = Boolean(findSavedNews);
				element.viewCount = findViews.length;
				arr.push(element);
			}
		}

		return getResponse(res, 200, 1, Messages.NEWS_FETCHED, arr);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getNewsDetailsById = async (req, res, next) => {
	try {
		const { userId } = req;
		const { id } = req.query;
		const findNews = await news.find({
			_id: id,
			isActive: true,
			isPublished: true,
		});

		if (findNews.length > 0) {
			let obj = JSON.parse(JSON.stringify(findNews[0]));
			const findViews = await newsViews.find({
				newsId: obj._id,
				isActive: true,
			});
			const findSavedNews = await savedNews.findOne({
				userId: userId,
				isActive: true,
				isSaved: true,
				newsId: obj._id,
			});

			obj.viewCount = findViews.length;
			let a = moment(obj.createdAt, "YYYYMMDD").fromNow();
			obj.timeDuration = a;
			obj.isSaved = Boolean(findSavedNews);

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

exports.readNewsOrArticle = async (req, res, next) => {
	try {
		const { newsId, isSaved } = req.body;

		const { userId } = req;
		const findUserNewsHistory = await userNewsHistory.findOne({
			newsId: newsId,
			userId: userId,
			isActive: true,
		});

		if (findUserNewsHistory) {
			const findNews = await news.find({
				_id: newsId,
				isActive: true,
				isPublished: true,
			});
			if (findNews.length > 0) {
				// if (isSaved) {
				// 	findUserNewsHistory.isSaved = isSaved;
				// }
				findUserNewsHistory.recentlyPlayed = true;
				findUserNewsHistory.save();

				return getResponse(res, 200, 1, Messages.ADD_NEWS_TO_HISTORY, "");
			} else {
				return getResponse(res, 400, 0, Messages.NEWS_NOT_FOUND);
			}
		} else {
			const findNews = await news.find({
				_id: newsId,
				isActive: true,
				isPublished: true,
			});
			if (findNews.length > 0) {
				const addNews = await userNewsHistory.create({
					newsId: newsId,
					userId: userId,
					recentlyPlayed: true,
					isActive: true,
				});
				if (addNews) {
					return getResponse(res, 200, 1, Messages.ADD_NEWS_TO_HISTORY, "");
				} else {
					return res
						.status(500)
						.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
				}
			} else {
				return getResponse(res, 400, 0, Messages.NEWS_NOT_FOUND);
			}
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllSavedNews = async (req, res, next) => {
	try {
		const { userId } = req;
		const findSavedNews = await savedNews
			.find({
				isActive: true,
				isSaved: true,
				userId,
			})
			.sort({ createdAt: -1 });

		if (findSavedNews.length > 0) {
			let arr = [];

			const uniqueNewsIds = removeDuplicates(findSavedNews, "newsId");

			const findNewsByIds = await news.find({
				_id: { $in: uniqueNewsIds },
				isActive: true,
				isPublished: true,
			});

			const findAllViews = await newsViews.find({
				newsId: { $in: uniqueNewsIds },
				isActive: true,
			});

			for (let index = 0; index < findSavedNews.length; index++) {
				const element = JSON.parse(JSON.stringify(findSavedNews[index]));

				const findNewsById = findNewsByIds.filter((i) =>
					i._id.equals(new ObjectId(element.newsId))
				);

				if (findNewsById.length > 0) {
					let publishDateDiff = moment(new Date()).diff(
						new Date(findNewsById[0].publishDate),
						"seconds"
					);

					if (publishDateDiff >= 0) {
						const json = JSON.parse(JSON.stringify(findNewsById));
						const findViews = findAllViews.filter((i) =>
							i.newsId.equals(element.newsId)
						);
						json[0].viewCount = findViews.length;
						element.newsDetails = json;
						arr.push(element);
					}
				}
			}
			return getResponse(res, 200, 1, Messages.NEWS_FETCHED, arr);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: news.js:150 ~ exports.getAllSavedNews= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllNewsAndArticlesByType = async (req, res, next) => {
	try {
		const { search, page, limit, type } = req.query;

		const { userId } = req;
		const skip = limit * page - limit;

		const findNews = await news
			.find({
				newsTitle: { $regex: search, $options: "i" },
				isActive: true,
				isPublished: true,
				type: type,
			})
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		let arr = [];

		const uniqueNewsIds = removeDuplicates(findNews, "_id");

		const findAllSavedNews = await savedNews.find({
			userId: userId,
			isActive: true,
			isSaved: true,
			newsId: { $in: uniqueNewsIds },
		});

		const findAllViews = await newsViews.find({
			newsId: { $in: uniqueNewsIds },
			isActive: true,
		});

		findNews.map(async (e) => {
			const data = JSON.parse(JSON.stringify(e));

			let publishDateDiff = moment(new Date()).diff(
				new Date(data.publishDate),
				"seconds"
			);

			if (publishDateDiff >= 0) {
				let a = moment(e.createdAt, "YYYYMMDD").fromNow();
				const findViews = findAllViews.filter((i) => i.newsId.equals(data._id));
				const findSavedNews = findAllSavedNews.find((i) =>
					i.newsId.equals(data._id)
				);
				data.isSaved = Boolean(findSavedNews);
				data.viewCount = findViews.length;
				data.timeDuration = a;
				arr.push(data);
				return data;
			}
		});

		return getResponse(res, 200, 1, Messages.NEWS_FETCHED, arr);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllBannerNews = async (req, res, next) => {
	try {
		const { search } = req.query;
		const { userId } = req;

		const findNews = await news
			.find({
				newsTitle: { $regex: search, $options: "i" },
				isActive: true,
				isBanner: true,
				isPublished: true,
			})
			.sort({ createdAt: -1 });

		let arr = [];

		const uniqueNewsIds = removeDuplicates(findNews, "_id");

		const findAllSavedNews = await savedNews.find({
			userId: userId,
			isActive: true,
			isSaved: true,
			newsId: { $in: uniqueNewsIds },
		});

		const findAllViews = await newsViews.find({
			newsId: { $in: uniqueNewsIds },
			isActive: true,
		});

		findNews.map(async (e) => {
			const data = JSON.parse(JSON.stringify(e));

			let publishDateDiff = moment(new Date()).diff(
				new Date(data.publishDate),
				"seconds"
			);

			if (publishDateDiff >= 0) {
				let a = moment(e.createdAt, "YYYYMMDD").fromNow();
				data.timeDuration = a;
				const findViews = findAllViews.filter((i) => i.newsId.equals(data._id));
				const findSavedNews = findAllSavedNews.find((i) =>
					i.newsId.equals(data._id)
				);
				data.isSaved = Boolean(findSavedNews);
				data.viewCount = findViews.length;
				arr.push(data);
				return data;
			}
		});

		return getResponse(res, 200, 1, Messages.NEWS_FETCHED, arr);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllRecentsPlayedNews = async (req, res, next) => {
	try {
		// const { type } = req.query;

		const { userId } = req;

		// if (!type) {
		// 	return res
		// 		.status(400)
		// 		.json({ status: 0, message: "Please provide type" });
		// }

		const findNews = await userNewsHistory
			.find({
				isActive: true,
				recentlyPlayed: true,
				userId: userId,
			})
			.sort({ createdAt: -1 });

		let arr = [];

		const uniqueNewsIds = removeDuplicates(findNews, "newsId");

		const uniqueUserIds = removeDuplicates(findNews, "userId");

		const findAllNewsDetails = await news.find({
			_id: { $in: uniqueNewsIds },
			isActive: true,
			isPublished: true,
			// type: type,
		});

		const findAllUsers = await User.find({
			_id: { $in: uniqueUserIds },
			isActive: true,
		});

		const findAllSavedNews = await savedNews.find({
			userId: userId,
			isActive: true,
			isSaved: true,
			newsId: { $in: uniqueNewsIds },
		});

		findNews.map(async (item) => {
			const element = JSON.parse(JSON.stringify(item));
			const findNewsDetails = findAllNewsDetails.find((i) =>
				i._id.equals(element.newsId)
			);

			const findUsers = findAllUsers.find((i) => i._id.equals(element.userId));

			const findSavedNews = findAllSavedNews.find((i) =>
				i.newsId.equals(element._id)
			);

			if (findNewsDetails && findUsers) {
				let publishDateDiff = moment(new Date()).diff(
					new Date(findNewsDetails.publishDate),
					"seconds"
				);
				if (publishDateDiff >= 0) {
					const userObj = JSON.parse(JSON.stringify(findUsers));
					delete userObj.password;
					element.createdTime = moment(
						new Date(findNewsDetails.publishDate)
					).format("D MMM YYYY");
					element.isSaved = Boolean(findSavedNews);
					element.newsDetails = findNewsDetails;
					element.usersDetails = userObj;
					arr.push(element);
				}
			}
		});

		return res.status(200).json({
			status: 1,
			message: Messages.RECNETLY_PLAY_NEWS_FETCHED,
			totalLength: arr.length,
			data: arr,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.viewNewsVideo = async (req, res, next) => {
	try {
		const { newsId } = req.body;
		const { userId } = req;

		const findNews = await news.findOne({
			_id: newsId,
			isPublished: true,
			isActive: true,
		});

		if (findNews) {
			const findViews = await newsViews.findOne({
				newsId: newsId,
				isActive: true,
				userId: userId,
			});

			if (!findViews) {
				const addNewsViews = await newsViews.create({
					newsId: newsId,
					userId: userId,
					isActive: true,
				});

				if (addNewsViews) {
					return getResponse(res, 200, 1, Messages.VIEW_NEWS_, "");
				} else {
					return res
						.status(500)
						.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
				}
			} else {
				return getResponse(res, 200, 0, Messages.ALREADY_VIEWED, "");
			}
		} else {
			return res
				.status(400)
				.json({ status: 0, message: Messages.NEWS_NOT_FOUND });
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addNewsSearch = async (req, res, next) => {
	try {
		const { userId } = req;
		const { title } = req.body;

		const findNewsSearch = await newsRecentSearch.find({
			title: title,
			userId: userId,
		});

		if (findNewsSearch.length > 0) {
			return getResponse(res, 200, 1, Messages.ADD_NEWS_SEARCH, {});
		}

		const addNewsSearch = await newsRecentSearch.create({
			title: title,
			userId: userId,
		});

		if (addNewsSearch) {
			return getResponse(res, 200, 1, Messages.ADD_NEWS_SEARCH, {});
		} else {
			return res
				.status(500)
				.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllNewsSearches = async (req, res, next) => {
	try {
		const { userId } = req;

		const findNewsSearch = await newsRecentSearch
			.find({
				userId: userId,
				isActive: true,
			})
			.limit(10)
			.sort({ createdAt: -1 });

		if (findNewsSearch.length > 0) {
			return getResponse(res, 200, 1, Messages.GET_News_SEARCH, findNewsSearch);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.saveUnsaveNewsAndArticle = async (req, res, next) => {
	try {
		const { userId } = req;
		const { newsId, isSaved } = req.body;

		const findUser = await User.findOne({ _id: userId, isActive: true });

		if (findUser) {
			const findNewsAndArticle = await news.findOne({
				_id: newsId,
				isActive: true,
			});
			if (findNewsAndArticle) {
				const findSavedNewsAndArticle = await savedNews.findOne({
					newsId: newsId,
					userId: userId,
					isActive: true,
				});

				let msg =
					findNewsAndArticle.type == "video"
						? isSaved
							? Messages.SAVED_TO_NEWS_VIDEO
							: Messages.UNSAVED_TO_NEWS_VIDEO
						: isSaved
						? Messages.SAVED_TO_NEWS_ARTICLE
						: Messages.UNSAVED_TO_NEWS_ARTICLE;

				if (findSavedNewsAndArticle) {
					findSavedNewsAndArticle.isSaved = isSaved;
					findSavedNewsAndArticle.save();

					return getResponse(res, 200, 1, msg);
				} else {
					const addSavedNewsAndArticle = new savedNews({
						newsId: newsId,
						userId: userId,
					});
					await addSavedNewsAndArticle.save();
					return getResponse(res, 200, 1, msg);
				}
			} else {
				return getResponse(res, 400, 0, Messages.NEWS_NOT_FOUND, "");
			}
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, "");
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: news.js:527 ~ exports.saveUnsaveNewsAndArticle= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
