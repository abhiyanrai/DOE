const { living } = require("../models/living");
const { Messages } = require("../utils/constant");
const { livingHistory } = require("../models/livingHistory");
const { User } = require("../models/users");
const { savedVideosAndArticles } = require("../models/savedVideosAndArticles");
const moment = require("moment");
const { livingRecentSearch } = require("../models/livingRecentSearch");
const { UserDetails } = require("../models/userDetails");
const { removeDuplicates } = require("../utils/functions");
const { livingComments } = require("../models/livingComments");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.getAllVideos = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;
		const { userId } = req;
		const skip = limit * page - limit;

		const [totalLength, findVideo] = await Promise.all([
			living.find({
				title: { $regex: search, $options: "i" },
				type: "video",
				isActive: true,
				isPublish: true,
			}),
			living
				.find({
					title: { $regex: search, $options: "i" },
					type: "video",
					isActive: true,
					isPublish: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 }),
		]);

		let arr = [];

		if (findVideo.length > 0) {
			const uniqueIds = removeDuplicates(findVideo, "_id");

			const findAllSavedVideosAndArticles = await savedVideosAndArticles.find({
				livingId: { $in: uniqueIds },
				userId: userId,
				isActive: true,
			});

			const countAllViews = await livingHistory.find({
				livingId: { $in: uniqueIds },
				isActive: true,
			});

			const myAllLike = await livingHistory.find({
				livingId: { $in: uniqueIds },
				userId: userId,
				isLike: true,
				isActive: true,
			});

			const totalAllLikeCount = await livingHistory.find({
				livingId: { $in: uniqueIds },
				isLike: true,
				isActive: true,
			});

			for (let index = 0; index < findVideo.length; index++) {
				const element = JSON.parse(JSON.stringify(findVideo[index]));

				let publishDateDiff = moment(new Date()).diff(
					new Date(element.publishDate),
					"seconds"
				);

				if (publishDateDiff >= 0) {
					const findSavedVideosAndArticles = findAllSavedVideosAndArticles.find(
						(i) => i.livingId.equals(element._id)
					);

					const countViews = countAllViews.filter((i) =>
						i.livingId.equals(element._id)
					);

					const myLike = myAllLike.find((i) => i.livingId.equals(element._id));

					const totalLikeCount = totalAllLikeCount.filter((i) =>
						i.livingId.equals(element._id)
					);

					element.myLike = Boolean(myLike);
					element.totalLikeCount = totalLikeCount.length;
					element.totalViewCount = countViews.length;
					element.time = moment(element.createdAt).startOf("day").fromNow();
					element.isSaved = Boolean(findSavedVideosAndArticles);
					arr.push(element);
				}
			}
		}

		return res.status(200).json({
			status: 1,
			message: Messages.ALL_VIDEOS,
			totalData: totalLength.length,
			data: arr,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllArticles = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;
		const { userId } = req;
		const skip = limit * page - limit;

		const [totalLength, findArticle] = await Promise.all([
			living.find({
				title: { $regex: search, $options: "i" },
				type: "article",
				isActive: true,
				isPublish: true,
			}),
			living
				.find({
					title: { $regex: search, $options: "i" },
					type: "article",
					isActive: true,
					isPublish: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 })
				.lean(),
		]);

		let arr = [];

		if (findArticle.length > 0) {
			const uniqueIds = removeDuplicates(findArticle, "_id");

			const findAllSavedVideosAndArticles = await savedVideosAndArticles.find({
				livingId: { $in: uniqueIds },
				userId: userId,
				isActive: true,
			});

			findArticle.map((item) => {
				const element = item;
				let publishDateDiff = moment(new Date()).diff(
					new Date(element.publishDate),
					"seconds"
				);

				if (publishDateDiff >= 0) {
					const findSavedVideosAndArticles = findAllSavedVideosAndArticles.find(
						(i) => i.livingId.equals(element._id)
					);

					element.time = moment(element.createdAt).startOf("day").fromNow();
					element.isSaved = Boolean(findSavedVideosAndArticles);
					arr.push(element);
				}
			});
		}

		return res.status(200).json({
			status: 1,
			message: Messages.ALL_ARTICLES,
			totalData: totalLength.length,
			data: arr,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllPopularVideos = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;
		const { userId } = req;
		const skip = limit * page - limit;

		const [totalLength, findVideo] = await Promise.all([
			living.find({
				title: { $regex: search, $options: "i" },
				type: "video",
				isActive: true,
				isPopular: true,
				isPublish: true,
			}),
			living
				.find({
					title: { $regex: search, $options: "i" },
					type: "video",
					isActive: true,
					isPopular: true,
					isPublish: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 })
				.lean(),
		]);

		let arr = [];

		if (findVideo.length > 0) {
			const uniqueIds = removeDuplicates(findVideo, "_id");

			const findAllSavedVideosAndArticles = await savedVideosAndArticles.find({
				livingId: { $in: uniqueIds },
				userId: userId,
				isActive: true,
			});

			const countAllViews = await livingHistory.find({
				livingId: { $in: uniqueIds },
				isActive: true,
			});

			const myAllLike = await livingHistory.find({
				livingId: { $in: uniqueIds },
				userId: userId,
				isLike: true,
				isActive: true,
			});

			const totalAllLikeCount = await livingHistory.find({
				livingId: { $in: uniqueIds },
				isLike: true,
				isActive: true,
			});

			for (let index = 0; index < findVideo.length; index++) {
				const element = findVideo[index];

				let publishDateDiff = moment(new Date()).diff(
					new Date(element.publishDate),
					"seconds"
				);

				if (publishDateDiff >= 0) {
					const findSavedVideosAndArticles = findAllSavedVideosAndArticles.find(
						(i) => i.livingId.equals(element._id)
					);

					const countViews = countAllViews.filter((i) =>
						i.livingId.equals(element._id)
					);

					const myLike = myAllLike.find((i) => i.livingId.equals(element._id));

					const totalLikeCount = totalAllLikeCount.filter((i) =>
						i.livingId.equals(element._id)
					);

					element.myLike = Boolean(myLike);
					element.totalLikeCount = totalLikeCount.length;
					element.totalViewCount = countViews.length;
					element.time = moment(element.createdAt).startOf("day").fromNow();
					element.isSaved = Boolean(findSavedVideosAndArticles);
					arr.push(element);
				}
			}
		}

		return res.status(200).json({
			status: 1,
			message: Messages.ALL_POPULAR_VIDEOS,
			totalData: totalLength.length,
			data: arr,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllPopularArticles = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;
		const { userId } = req;
		const skip = limit * page - limit;

		const [totalLength, findArticle] = await Promise.all([
			living.find({
				title: { $regex: search, $options: "i" },
				type: "article",
				isActive: true,
				isPublish: true,
			}),
			living
				.find({
					title: { $regex: search, $options: "i" },
					type: "article",
					isActive: true,
					isPublish: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 })
				.lean(),
		]);

		let arr = [];

		if (findArticle.length > 0) {
			const uniqueIds = removeDuplicates(findArticle, "_id");

			const findAllSavedVideosAndArticles = await savedVideosAndArticles.find({
				livingId: { $in: uniqueIds },
				userId: userId,
				isActive: true,
			});

			findArticle.map((item) => {
				const element = item;
				let publishDateDiff = moment(new Date()).diff(
					new Date(element.publishDate),
					"seconds"
				);

				if (publishDateDiff >= 0) {
					const findSavedVideosAndArticles = findAllSavedVideosAndArticles.find(
						(i) => i.livingId.equals(element._id)
					);

					element.time = moment(element.createdAt).startOf("day").fromNow();
					element.isSaved = Boolean(findSavedVideosAndArticles);
					arr.push(element);
				}
			});
		}

		return res.status(200).json({
			status: 1,
			message: Messages.ALL_POPULAR_ARTICLE,
			totalData: totalLength.length,
			data: arr,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getVideoAndArticlesDetailsById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const { userId } = req;

		const findVideoAndArticles = await living
			.find({
				_id: id,
				isActive: true,
				isPublish: true,
			})
			.lean();

		if (findVideoAndArticles.length > 0) {
			let obj = findVideoAndArticles[0];
			let publishDateDiff = moment(new Date()).diff(
				new Date(obj.publishDate),
				"seconds"
			);

			if (publishDateDiff >= 0) {
				if (obj.type == "video") {
					const findLikes = await livingHistory.find({
						livingId: obj._id,
						isActive: true,
						isLike: true,
					});

					const findComment = await livingComments.aggregate([
						{
							$lookup: {
								from: "users",
								localField: "userId",
								foreignField: "_id",
								as: "userDetails",
							},
						},
						{
							$match: {
								livingId: obj._id,
								message: { $ne: "" },
								isActive: true,
							},
						},
						{
							$sort: {
								createdAt: -1,
							},
						},
					]);

					let commentCount = findComment.filter(
						(i) => i.userDetails.length > 0
					);

					const findMyLike = await livingHistory.find({
						userId: userId,
						livingId: obj._id,
						isLike: true,
						isActive: true,
					});

					obj.likeCount = findLikes.length;
					obj.myLike = Boolean(findMyLike);
					obj.commentCount = commentCount.length;
				}

				const findSavedVideosAndArticles = await savedVideosAndArticles.findOne(
					{
						livingId: obj._id,
						userId: userId,
						isActive: true,
					}
				);

				obj.time = moment(obj.createdAt).startOf("day").fromNow();
				obj.isSaved = Boolean(findSavedVideosAndArticles);
			}
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

exports.addComment = async (req, res, next) => {
	try {
		const { id, comment } = req.body;
		const { userId } = req;

		const findVideo = await living.findOne({
			_id: id,
			isActive: true,
			isPublish: true,
			type: "video",
		});

		if (findVideo) {
			const isUserExist = await User.findOne({
				_id: userId,
				isActive: true,
			});

			if (isUserExist) {
				const findHistory = await livingHistory.findOne({
					userId: userId,
					livingId: id,
				});
				if (findHistory) {
					const addComment = await livingComments.create({
						userId: userId,
						livingId: id,
						message: comment,
					});
					if (addComment) {
						return getResponse(res, 200, 1, Messages.ADD_COMMENT, addComment);
					} else {
						return res
							.status(500)
							.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
					}
				} else {
					return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
				}
			} else {
				return getResponse(res, 200, 0, Messages.USER_NOT_FOUND, {});
			}
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.viewVideoOrArticles = async (req, res, next) => {
	try {
		const { livingId } = req.body;

		const { userId } = req;
		const findlivingHistory = await livingHistory.findOne({
			livingId: livingId,
			userId: userId,
			isActive: true,
		});

		if (findlivingHistory) {
			const findliving = await living.find({
				_id: livingId,
				isActive: true,
				isPublish: true,
			});
			if (findliving.length > 0) {
				findlivingHistory.recentPlayed = true;
				findlivingHistory.save();

				return getResponse(res, 200, 1, Messages.ADD_VIEWS_LIVING, "");
			} else {
				return getResponse(res, 400, 0, Messages.DATA_NOT_FOUND);
			}
		} else {
			const findliving = await living.find({
				_id: livingId,
				isActive: true,
				isPublish: true,
			});
			if (findliving.length > 0) {
				const addliving = await livingHistory.create({
					livingId: livingId,
					userId: userId,
					recentPlayed: true,
					isActive: true,
				});
				if (addliving) {
					return getResponse(res, 200, 1, Messages.ADD_Views, "");
				} else {
					return res
						.status(500)
						.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
				}
			} else {
				return getResponse(res, 400, 0, Messages.DATA_NOT_FOUND);
			}
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.likeOrUnlike = async (req, res, next) => {
	try {
		const { livingId, isLike } = req.body;
		const { userId } = req;

		const findVideo = await living.findOne({
			_id: livingId,
			isActive: true,
			type: "video",
			isPublish: true,
		});

		if (findVideo) {
			const findHistory = await livingHistory.findOne({
				userId: userId,
				livingId: livingId,
			});

			if (findHistory) {
				findHistory.isLike = isLike;
				findHistory.save();
				return getResponse(
					res,
					200,
					1,
					isLike ? Messages.ADD_LIKE : Messages.ADD_UNLIKE,
					findHistory
				);
			} else {
				const addHistory = await livingHistory.create({
					userId: userId,
					isLike: isLike,
					livingId: livingId,
					recentPlayed: true,
				});
				return getResponse(
					res,
					200,
					1,
					isLike ? Messages.ADD_LIKE : Messages.ADD_UNLIKE,
					addHistory
				);
			}
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllCommentById = async (req, res, next) => {
	try {
		const { id } = req.query;

		const { userId } = req;

		const findVideo = await living.findOne({
			_id: id,
			isActive: true,
			isPublish: true,
			type: "video",
		});

		if (findVideo) {
			const findAllComments = await livingComments
				.find({
					livingId: id,
					isActive: true,
					message: { $ne: "" },
				})
				.sort({ createdAt: -1 })
				.lean();

			if (findAllComments.length > 0) {
				let arr = [];

				const findUser = await User.findOne(
					{
						_id: userId,
						isActive: true,
					},
					{
						_id: 1,
					}
				);

				const uniqueIds = removeDuplicates(findAllComments, "userId");

				const isAllUserExist = await User.find(
					{
						_id: { $in: uniqueIds },
						isActive: true,
					},
					{
						_id: 1,
						email: 1,
						name: 1,
						gender: 1,
						isActive: 1,
						createdAt: 1,
						updatedAt: 1,
						__v: 1,
					}
				).lean();

				const allUserProfile = await UserDetails.find({
					userId: { $in: uniqueIds },
				});

				for (let index = 0; index < findAllComments.length; index++) {
					const element = findAllComments[index];

					const isUserExist = isAllUserExist.find((i) =>
						i._id.equals(element.userId)
					);

					if (isUserExist) {
						const userProfile = allUserProfile.find((i) =>
							i.userId.equals(isUserExist._id)
						);

						isUserExist.profile = userProfile
							? userProfile.profile == "null"
								? ""
								: userProfile.profile
							: "";

						element.myComment = element.userId.equals(findUser?._id)
							? true
							: false;
						element.userDetails = isUserExist;
						arr.push(element);
					}
				}
				return getResponse(res, 200, 1, Messages.COMMENT_FETCHED, arr);
			} else {
				return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
			}
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: living.js:347 ~ exports.getAllCommentById= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.savedUnsavedVideoAndArticles = async (req, res, next) => {
	try {
		const { userId } = req;
		const { livingId, isSaved } = req.body;

		const findUser = await User.findOne({ _id: userId, isActive: true });

		if (findUser) {
			const findliving = await living.findOne({
				_id: livingId,
				isActive: true,
				isPublish: true,
			});
			if (findliving) {
				const findSavedVideosAndArticles = await savedVideosAndArticles.findOne(
					{
						livingId: livingId,
						userId: userId,
						isActive: true,
					}
				);
				if (findSavedVideosAndArticles) {
					findSavedVideosAndArticles.isActive = isSaved;
					findSavedVideosAndArticles.save();

					let msg =
						findliving.type == "video"
							? isSaved == "true"
								? "Video" + Messages.ADD_VIDEO_OR_ARTICLE
								: "Video" + Messages.REMOVE_VIDEO_OR_ARTICLE
							: isSaved == "true"
							? "Article" + Messages.ADD_VIDEO_OR_ARTICLE
							: "Article" + Messages.REMOVE_VIDEO_OR_ARTICLE;

					return getResponse(res, 200, 1, msg);
				} else {
					const addSavedVideosAndArticles = new savedVideosAndArticles({
						livingId: livingId,
						userId: userId,
					});
					await addSavedVideosAndArticles.save();
					return getResponse(
						res,
						200,
						1,
						findliving.type == "Video"
							? "Video" + Messages.ADD_VIDEO_OR_ARTICLE
							: "Article" + Messages.ADD_VIDEO_OR_ARTICLE,
						""
					);
				}
			} else {
				return getResponse(res, 400, 0, Messages.DATA_NOT_FOUND, "");
			}
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllUserSavedVideosAndArticles = async (req, res, next) => {
	try {
		const { userId } = req;
		const { search } = req.query;

		const findSavedVideosAndArticles = await savedVideosAndArticles
			.find({
				userId: userId,
				isActive: true,
			})
			.sort({ createdAt: -1 })
			.lean();

		if (findSavedVideosAndArticles.length > 0) {
			const data = [];

			const uniqueIds = removeDuplicates(
				findSavedVideosAndArticles,
				"livingId"
			);

			const findAllLiving = await living.find({
				_id: { $in: uniqueIds },
				isPublish: true,
				isActive: true,
			});

			const countAllViews = await livingHistory.find({
				livingId: { $in: uniqueIds },
				isActive: true,
			});

			for (let items of findSavedVideosAndArticles) {
				const findliving = findAllLiving.find((i) =>
					i._id.equals(items.livingId)
				);

				if (findliving && findliving.title.indexOf(search) !== -1) {
					let obj = items;
					const countViews = countAllViews.filter((i) =>
						i.livingId.equals(items.livingId)
					);

					obj.totalViewCount = countViews.length;
					obj.time = moment(obj.createdAt).startOf("day").fromNow();
					obj.findlivingDetails = findliving;
					data.push(obj);
				}
			}

			return getResponse(
				res,
				200,
				1,
				Messages.VIDEOS_AND_ARTICLE_SAVED_DATA,
				data
			);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: living.js:451 ~ exports.getAllUserSavedVideosAndArticles= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllRecentsPlayedVideoAndArticles = async (req, res, next) => {
	try {
		const { search } = req.query;

		const { userId } = req;
		const findlivingHistory = await livingHistory
			.find({
				isActive: true,
				recentPlayed: true,
				userId: userId,
			})
			.sort({ createdAt: -1 })
			.lean();

		let arr = [];

		if (findlivingHistory.length > 0) {
			const uniqueIds = removeDuplicates(findlivingHistory, "livingId");

			const findAlllivingHistoryDetails = await living.find({
				_id: { $in: uniqueIds },
				isActive: true,
				isPublish: true,
			});

			const findUsers = await User.findOne({
				_id: userId,
				isActive: true,
			}).lean();

			const findAllSavedVideosAndArticles = await savedVideosAndArticles.find({
				userId: userId,
				isActive: true,
				isSaved: true,
				livingId: { $in: uniqueIds },
			});

			findlivingHistory.map((element) => {
				const findlivingHistoryDetails = findAlllivingHistoryDetails.find((i) =>
					i._id.equals(element.livingId)
				);

				const findSavedVideosAndArticles = findAllSavedVideosAndArticles.find(
					(i) => i.livingId.equals(element._id)
				);

				if (findlivingHistoryDetails && findUsers) {
					delete findUsers.password;
					element.isSaved = Boolean(findSavedVideosAndArticles);
					element.livingDetails = findlivingHistoryDetails;
					element.usersDetails = findUsers;
					arr.push(element);
				}
			});
		}

		return res.status(200).json({
			status: 1,
			message: Messages.RECNETLY_PLAY_VIDEOS_ARTICLES_FETCHED,
			totalLength: arr.length,
			data: arr,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllBannerVideosAndArticles = async (req, res, next) => {
	try {
		const { search } = req.query;
		const { userId } = req;

		const findData = await living
			.find({
				title: { $regex: search, $options: "i" },
				isActive: true,
				isBanner: true,
				isPublish: true,
			})
			.sort({ createdAt: -1 })
			.lean();

		let arr = [];

		if (findData.length > 0) {
			const uniqueIds = removeDuplicates(findData, "_id");

			const findAllSavedVideosAndArticles = await savedVideosAndArticles.find({
				userId: userId,
				isActive: true,
				isSaved: true,
				livingId: { $in: uniqueIds },
			});

			findData.map(async (data) => {
				let publishDateDiff = moment(new Date()).diff(
					new Date(data.publishDate),
					"seconds"
				);

				if (publishDateDiff >= 0) {
					let a = moment(data.createdAt, "YYYYMMDD").fromNow();
					data.timeDuration = a;

					const findSavedVideosAndArticles = findAllSavedVideosAndArticles.find(
						(i) => i.livingId.equals(data._id)
					);
					data.isSaved = Boolean(findSavedVideosAndArticles);
					arr.push(data);
					return data;
				}
			});
		}

		return getResponse(res, 200, 1, Messages.VIDEO_ARTICLE_FETCHED, arr);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addLivingRecentSearch = async (req, res, next) => {
	try {
		const { userId } = req;
		const { title } = req.body;
		const findlivingSearch = await livingRecentSearch.find({
			title: title,
			userId: userId,
		});

		if (findlivingSearch.length > 0) {
			return getResponse(res, 200, 1, Messages.ADD_LIVING_SEARCH, {});
		}

		const addlivingSearch = await livingRecentSearch.create({
			title: title,
			userId: userId,
		});

		if (addlivingSearch) {
			return getResponse(res, 200, 1, Messages.ADD_LIVING_SEARCH, {});
		} else {
			return res
				.status(500)
				.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: living.js:701 ~ exports.addlivingRecentSearch= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllLivingSearches = async (req, res, next) => {
	try {
		const { userId } = req;

		const findlivingSearch = await livingRecentSearch
			.find({
				userId: userId,
				isActive: true,
			})
			.limit(10)
			.sort({ createdAt: -1 });

		if (findlivingSearch.length > 0) {
			return getResponse(
				res,
				200,
				1,
				Messages.GET_LIVING_SEARCH,
				findlivingSearch
			);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllVideosAndArticlesBySearch = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;
		const { userId } = req;
		const skip = limit * page - limit;

		const [totalLength, findVideoArticle] = await Promise.all([
			living.find({
				title: { $regex: search, $options: "i" },
				isActive: true,
				isPublish: true,
			}),
			living
				.find({
					title: { $regex: search, $options: "i" },
					isActive: true,
					isPublish: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 })
				.lean(),
		]);

		let articleArr = [];
		let videosArr = [];

		if (findVideoArticle.length > 0) {
			const uniqueIds = removeDuplicates(findVideoArticle, "_id");

			const savedAllVideosAndArticle = await savedVideosAndArticles.find({
				livingId: { $in: uniqueIds },
				userId: userId,
				isActive: true,
			});

			const countAllViews = await livingHistory.find({
				livingId: { $in: uniqueIds },
				isActive: true,
			});

			findVideoArticle.map((element) => {
				let publishDateDiff = moment(new Date()).diff(
					new Date(element.publishDate),
					"seconds"
				);

				if (publishDateDiff >= 0) {
					const savedVideosAndArticle = savedAllVideosAndArticle.find((i) =>
						i.livingId.equals(element._id)
					);

					const countViews = countAllViews.filter((i) =>
						i.livingId.equals(element._id)
					);

					element.totalCount = countViews.length;
					element.time = moment(element.createdAt).startOf("day").fromNow();
					element.isSaved = Boolean(savedVideosAndArticle);

					if (element.type == "article") {
						articleArr.push(element);
					} else {
						videosArr.push(element);
					}
				}
			});
		}

		return res.status(200).json({
			status: 1,
			message: Messages.ALL_VIDEOS_AND_ARTICLES,
			totalData: totalLength.length,
			articleLength: articleArr.length,
			videosLength: videosArr.length,
			articleArr,
			videosArr,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
