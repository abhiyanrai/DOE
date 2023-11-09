const { entertainment } = require("../models/entertainment");
const { Messages } = require("../utils/constant");
const { entertainmentHistory } = require("../models/entertainmentHistory");
const { User } = require("../models/users");
const { savedVideosAndInshorts } = require("../models/savedVideosAndInshorts");
const moment = require("moment");
const { UserDetails } = require("../models/userDetails");
const {
	entertainmentRecentSearch,
} = require("../models/entertainmentRecentSearch");
const {
	calculateTimeDifference,
	removeDuplicates,
} = require("../utils/functions");
const { entertainmentComments } = require("../models/entertainmentComments");

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

		let [findVideo, totalLength] = await Promise.all([
			entertainment
				.find({
					title: { $regex: search, $options: "i" },
					type: "video",
					isActive: true,
					isPublish: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 }),
			entertainment.count({
				title: { $regex: search, $options: "i" },
				type: "video",
				isActive: true,
				isPublish: true,
			}),
		]);

		let arr = [];

		const uniqueIds = removeDuplicates(findVideo, "_id");

		const findAllSavedVideosAndInshorts = await savedVideosAndInshorts.find({
			entertainmentId: { $in: uniqueIds },
			userId: userId,
			isActive: true,
		});

		const countAllViews = await entertainmentHistory.find({
			entertainmentId: { $in: uniqueIds },
			isActive: true,
		});

		for (let index = 0; index < findVideo.length; index++) {
			const element = JSON.parse(JSON.stringify(findVideo[index]));

			let publishDateDiff = moment(new Date()).diff(
				new Date(element.publishDate),
				"seconds"
			);

			if (publishDateDiff >= 0) {
				const findSavedVideosAndInshorts = findAllSavedVideosAndInshorts.find(
					(i) => i.entertainmentId.equals(element._id)
				);

				const countViews = countAllViews.filter((i) =>
					i.entertainmentId.equals(element._id)
				);

				element.totalCount = countViews.length;
				element.time = calculateTimeDifference(new Date(element.publishDate));

				element.isSaved = Boolean(findSavedVideosAndInshorts);
				arr.push(element);
			}
		}

		return res.status(200).json({
			status: 1,
			message: Messages.ALL_VIDEOS,
			totalData: totalLength,
			data: arr,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllInshorts = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;
		const { userId } = req;
		const skip = limit * page - limit;

		let [findAllInshorts, totalLength] = await Promise.all([
			entertainment
				.find({
					title: { $regex: search, $options: "i" },
					type: "inshorts",
					isActive: true,
					isPublish: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 }),
			entertainment.count({
				title: { $regex: search, $options: "i" },
				type: "inshorts",
				isActive: true,
				isPublish: true,
			}),
		]);

		let arr = [];

		const uniqueIds = removeDuplicates(findAllInshorts, "_id");

		const findAllSavedVideosAndInshorts = await savedVideosAndInshorts.find({
			entertainmentId: { $in: uniqueIds },
			userId: userId,
			isActive: true,
		});

		for (let index = 0; index < findAllInshorts.length; index++) {
			const element = JSON.parse(JSON.stringify(findAllInshorts[index]));
			let publishDateDiff = moment(new Date()).diff(
				new Date(element.publishDate),
				"seconds"
			);

			if (publishDateDiff >= 0) {
				const findSavedVideosAndInshorts = findAllSavedVideosAndInshorts.find(
					(i) => i.entertainmentId.equals(element._id)
				);

				const timeDiff = calculateTimeDifference(new Date(element.publishDate));
				element.publishDate = timeDiff ? timeDiff : element.publishDate;
				element.isSaved = Boolean(findSavedVideosAndInshorts);
				arr.push(element);
			}
		}

		return res.status(200).json({
			status: 1,
			message: Messages.ALL_SHORTS,
			totalData: totalLength,
			data: arr,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getVideoAndInshortsDetailsById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const { userId } = req;

		const findVideoAndInshorts = await entertainment.find({
			_id: id,
			isActive: true,
			isPublish: true,
		});

		if (findVideoAndInshorts.length > 0) {
			let obj = JSON.parse(JSON.stringify(findVideoAndInshorts[0]));

			let publishDateDiff = moment(new Date()).diff(
				new Date(obj.publishDate),
				"seconds"
			);

			if (publishDateDiff >= 0) {
				if (obj.type == "video") {
					const findLikes = await entertainmentHistory.find({
						entertainmentId: obj._id,
						isActive: true,
						isLike: true,
					});

					const findComment = await entertainmentComments.find({
						entertainmentId: id,
						isActive: true,
					});

					const uniqueUserIds = findComment.reduce((uniqueIds, item) => {
						if (!uniqueIds.includes(item.userId)) {
							uniqueIds.push(item.userId);
						}
						return uniqueIds;
					}, []);

					const findAllUser = await User.find({
						_id: { $in: uniqueUserIds },
						isActive: true,
					});

					const findUser = findComment.filter((e) =>
						findAllUser.find((i) => i._id.equals(e.userId) && e.message != "")
					);

					const findMyLike = await entertainmentHistory.find({
						userId: userId,
						entertainmentId: obj._id,
						isLike: true,
					});

					const countViews = await entertainmentHistory.find({
						entertainmentId: obj._id,
						isActive: true,
					});

					obj.likeCount = findLikes.length;
					obj.myLike = findMyLike.length;
					obj.commentCount = findUser.length;
					obj.totalCount = countViews.length;
				}

				const findSavedVideosAndInshorts = await savedVideosAndInshorts.findOne(
					{
						entertainmentId: obj._id,
						userId: userId,
						isActive: true,
					}
				);

				obj.time = moment(obj.createdAt).startOf("day").fromNow();
				obj.isSaved = Boolean(findSavedVideosAndInshorts);
			}
			return getResponse(res, 200, 1, Messages.VIDEO_INSHORTS_FETCHED, obj);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: entertainment.js:256 ~ exports.getVideoAndInshortsDetailsById= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addComment = async (req, res, next) => {
	try {
		const { id, comment } = req.body;
		const { userId } = req;

		const findVideo = await entertainment.findOne({
			_id: id,
			isActive: true,
			type: "video",
			isPublish: true,
		});

		if (findVideo) {
			const addComment = await entertainmentComments.create({
				entertainmentId: id,
				userId: userId,
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
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.viewVideoOrInshorts = async (req, res, next) => {
	try {
		const { entertainmentId } = req.body;

		const { userId } = req;
		const findEntertainmentHistory = await entertainmentHistory.findOne({
			entertainmentId: entertainmentId,
			userId: userId,
			isActive: true,
		});

		if (findEntertainmentHistory) {
			const findEntertainment = await entertainment.find({
				_id: entertainmentId,
				isActive: true,
				isPublish: true,
			});
			if (findEntertainment.length > 0) {
				findEntertainmentHistory.recentPlayed = true;
				findEntertainmentHistory.save();

				return getResponse(res, 200, 1, Messages.ADD_Views, "");
			} else {
				return getResponse(res, 400, 0, Messages.DATA_NOT_FOUND);
			}
		} else {
			const findEntertainment = await entertainment.find({
				_id: entertainmentId,
				isActive: true,
				isPublish: true,
			});
			if (findEntertainment.length > 0) {
				const addEntertainment = await entertainmentHistory.create({
					entertainmentId: entertainmentId,
					userId: userId,
					recentPlayed: true,
					isActive: true,
				});
				if (addEntertainment) {
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
		const { entertainmentId, isLike } = req.body;
		const { userId } = req;

		const findVideo = await entertainment.findOne({
			_id: entertainmentId,
			isActive: true,
			type: "video",
			isPublish: true,
		});

		if (findVideo) {
			const findHistory = await entertainmentHistory.findOne({
				userId: userId,
				entertainmentId: entertainmentId,
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
				return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
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

		const findVideo = await entertainment.findOne({
			_id: id,
			isActive: true,
			type: "video",
			isPublish: true,
		});

		if (findVideo) {
			const findAllComment = await entertainmentComments
				.find({
					entertainmentId: id,
					isActive: true,
					message: { $ne: "" },
				})
				.sort({ createdAt: -1 });

			if (findAllComment.length > 0) {
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

				const uniqueIds = removeDuplicates(findAllComment, "userId");

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
				);

				const allUserProfile = await UserDetails.find({
					userId: { $in: uniqueIds },
				});

				for (let index = 0; index < findAllComment.length; index++) {
					const element = JSON.parse(JSON.stringify(findAllComment[index]));

					const isUserExist = isAllUserExist.find((i) =>
						i._id.equals(element.userId)
					);

					if (isUserExist) {
						const userProfile = allUserProfile.find((i) =>
							i.userId.equals(isUserExist._id)
						);

						const obj = JSON.parse(JSON.stringify(isUserExist));

						if (userProfile) {
							obj.profile = userProfile
								? userProfile.profile == "null"
									? ""
									: userProfile.profile
								: "";
						}

						element.userDetails = obj;
						element.myComment = element.userId == findUser?._id ? true : false;
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
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.savedUnsavedVideoAndInshorts = async (req, res, next) => {
	try {
		const { userId } = req;
		const { entertainmentId, isSaved } = req.body;

		const findUser = await User.findOne({ _id: userId, isActive: true });

		if (findUser) {
			const findEntertainment = await entertainment.findOne({
				_id: entertainmentId,
				isActive: true,
				isPublish: true,
			});
			if (findEntertainment) {
				const findSavedVideosAndInshorts = await savedVideosAndInshorts.findOne(
					{
						entertainmentId: entertainmentId,
						userId: userId,
						isActive: true,
					}
				);
				if (findSavedVideosAndInshorts) {
					findSavedVideosAndInshorts.isActive = isSaved;
					findSavedVideosAndInshorts.save();

					return getResponse(
						res,
						200,
						1,
						findEntertainment.type == "video"
							? "Video" + Messages.Entertainment_SAVED_LIST
							: "Inshorts" + Messages.Entertainment_SAVED_LIST,
						""
					);
				} else {
					const addSavedVideosAndInshorts = new savedVideosAndInshorts({
						entertainmentId: entertainmentId,
						userId: userId,
					});
					await addSavedVideosAndInshorts.save();
					return getResponse(
						res,
						200,
						1,
						findEntertainment.type == "video"
							? "Video" + Messages.Entertainment_SAVED_LIST
							: "Inshorts" + Messages.Entertainment_SAVED_LIST,
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

exports.getAllUserSavedVideosAndInshorts = async (req, res, next) => {
	try {
		const { userId } = req;
		const { search } = req.query;

		const findSavedVideosAndInshorts = await savedVideosAndInshorts
			.find({
				userId: userId,
				isActive: true,
			})
			.sort({ createdAt: -1 });

		if (findSavedVideosAndInshorts.length > 0) {
			const data = [];

			const uniqueIds = removeDuplicates(
				findSavedVideosAndInshorts,
				"entertainmentId"
			);

			const findAllEntertainment = await entertainment.find({
				_id: { $in: uniqueIds },
				isActive: true,
				isPublish: true,
			});

			const countAllViews = await entertainmentHistory.find({
				entertainmentId: { $in: uniqueIds },
				isActive: true,
			});

			for (let items of findSavedVideosAndInshorts) {
				const findEntertainment = findAllEntertainment.find((i) =>
					i._id.equals(items.entertainmentId)
				);

				if (
					findEntertainment &&
					findEntertainment.title.indexOf(search) !== -1
				) {
					let obj = JSON.parse(JSON.stringify(items));
					const countViews = countAllViews.filter((i) =>
						i.entertainmentId.equals(items.entertainmentId)
					);

					obj.totalViewCount = countViews.length;
					obj.time = moment(obj.createdAt).startOf("day").fromNow();
					obj.findEntertainmentDetails = findEntertainment;
					data.push(obj);
				}
			}

			return getResponse(res, 200, 1, Messages.VIDEO_INSHORTS_DATA, data);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllRecentsPlayedVideoAndInshorts = async (req, res, next) => {
	try {
		const { userId } = req;
		const findEntertainment = await entertainmentHistory
			.find({
				isActive: true,
				recentPlayed: true,
				userId: userId,
			})
			.sort({ createdAt: -1 });
       
		let arr = [];

		const uniqueIds = removeDuplicates(findEntertainment, "entertainmentId");

		let inshortsArr = [];
		let videosArr = [];
		if (uniqueIds.length > 0) {
			const uniqueUserIds = removeDuplicates(findEntertainment, "userId");

			const findAllEntertainmentDetails = await entertainment.find({
				_id: { $in: uniqueIds },
				isPublish: true,
				isActive: true,
			});
           
			const findAllUsers = await User.find(
				{
					_id: { $in: uniqueUserIds },
					isActive: true,
				},
				{
					_id: 1,
					email: 1,
					name: 1,
					dob: 1,
					gender: 1,
					birthPlace: 1,
					phoneNumber: 1,
					Otp: 1,
					isActive: 1,
					role: 1,
					deviceToken: 1,
					createdAt: 1,
					updatedAt: 1,
					__v: 1,
				}
			);

			const findAllSavedNews = await savedVideosAndInshorts.find({
				userId: userId,
				isActive: true,
				isSaved: true,
				entertainmentId: { $in: uniqueIds },
			});

			for (let index = 0; index < findEntertainment.length; index++) {
				const element = JSON.parse(JSON.stringify(findEntertainment[index]));

				const findEntertainmentDetails = findAllEntertainmentDetails.find((i) =>
					i._id.equals(element.entertainmentId)
				);

				const findUsers = findAllUsers.find((i) =>
					i._id.equals(element.userId)
				);

				if (findEntertainmentDetails && findUsers) {
					const findSavedNews = findAllSavedNews.find((i) =>
						i._id.equals(element.entertainmentId)
					);

					const timeDiff = calculateTimeDifference(
						new Date(findEntertainmentDetails.publishDate)
					);

					element.isSaved = Boolean(findSavedNews);
					element.publishDate = timeDiff;
					element.entertainmentDetails = findEntertainmentDetails;
					element.usersDetails = findUsers;

					if (findEntertainmentDetails.type == "video") {
						videosArr.push(element);
					} else {
						inshortsArr.push(element);
					}
				}
			}
		}

		return res.status(200).json({
			status: 1,
			message: Messages.RECNETLY_PLAY_ENTERTAINMENT_FETCHED,
			totalLength: inshortsArr.length + videosArr.length,
			data: { inshortsArr, videosArr },
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllBannerVideosAndInshorts = async (req, res, next) => {
	try {
		const { search } = req.query;
		const { userId } = req;

		const findNews = await entertainment
			.find({
				title: { $regex: search, $options: "i" },
				isActive: true,
				isBanner: true,
				isPublish: true,
			})
			.sort({ createdAt: -1 });

		let arr = [];

		const findAllSavedNews = await savedVideosAndInshorts.find({
			userId: userId,
			isActive: true,
			isSaved: true,
		});

		const mapArr = findNews.map(async (e) => {
			const data = JSON.parse(JSON.stringify(e));

			let publishDateDiff = moment(new Date()).diff(
				new Date(data.publishDate),
				"seconds"
			);

			if (publishDateDiff >= 0) {
				let a = moment(e.createdAt, "YYYYMMDD").fromNow();
				data.timeDuration = a;

				const findSavedNews = findAllSavedNews.find((i) =>
					i.entertainmentId.equals(data._id)
				);

				data.isSaved = Boolean(findSavedNews);
				arr.push(data);
				return data;
			}
		});

		return getResponse(res, 200, 1, Messages.VIDEO_INSHORTS_FETCHED, arr);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllVideosAndInshortsBySearch = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;
		const { userId } = req;
		const skip = limit * page - limit;

		const [totalLength, findVideoInshorts] = await Promise.all([
			entertainment.find({
				title: { $regex: search, $options: "i" },
				isActive: true,
				isPublish: true,
			}),
			entertainment
				.find({
					title: { $regex: search, $options: "i" },
					isActive: true,
					isPublish: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 }),
		]);

		let inshortsArr = [];
		let videosArr = [];

		if (findVideoInshorts.length > 0) {
			const uniqueIds = removeDuplicates(findVideoInshorts, "_id");

			const findAllSavedVideosAndInshorts = await savedVideosAndInshorts.find({
				userId: userId,
				isActive: true,
				entertainmentId: { $in: uniqueIds },
			});

			const countAllViews = await entertainmentHistory.find({
				entertainmentId: { $in: uniqueIds },
				isActive: true,
			});

			for (let index = 0; index < findVideoInshorts.length; index++) {
				const element = JSON.parse(JSON.stringify(findVideoInshorts[index]));

				let publishDateDiff = moment(new Date()).diff(
					new Date(element.publishDate),
					"seconds"
				);

				if (publishDateDiff >= 0) {
					const findSavedVideosAndInshorts = findAllSavedVideosAndInshorts.find(
						(i) => i.entertainmentId.equals(element._id)
					);

					const countViews = countAllViews.filter((i) =>
						i.entertainmentId.equals(element._id)
					);

					element.totalCount = countViews.length;
					element.time = calculateTimeDifference(new Date(element.publishDate));
					element.isSaved = Boolean(findSavedVideosAndInshorts);

					if (element.type == "inshorts") {
						inshortsArr.push(element);
					} else {
						videosArr.push(element);
					}
				}
			}
		}

		return res.status(200).json({
			status: 1,
			message: Messages.ALL_VIDEOS_AND_INSHORTS,
			totalData: totalLength.length,
			inshortsLength: inshortsArr.length,
			videosLength: videosArr.length,
			inshortsArr,
			videosArr,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addEntertainmentRecentSearch = async (req, res, next) => {
	try {
		const { userId } = req;
		const { title } = req.body;
		const findEntertainmentSearch = await entertainmentRecentSearch.find({
			title: title,
			userId: userId,
		});

		if (findEntertainmentSearch.length > 0) {
			return getResponse(res, 200, 1, Messages.ADD_ENTERTAINMENT_SEARCH, {});
		}

		const addEntertainmentSearch = await entertainmentRecentSearch.create({
			title: title,
			userId: userId,
		});

		if (addEntertainmentSearch) {
			return getResponse(res, 200, 1, Messages.ADD_ENTERTAINMENT_SEARCH, {});
		} else {
			return res
				.status(500)
				.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: entertainment.js:701 ~ exports.addEntertainmentRecentSearch= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllEntertainmentSearches = async (req, res, next) => {
	try {
		const { userId } = req;

		const findEntertainmentSearch = await entertainmentRecentSearch
			.find({
				userId: userId,
				isActive: true,
			})
			.limit(10)
			.sort({ createdAt: -1 });

		if (findEntertainmentSearch.length > 0) {
			return getResponse(
				res,
				200,
				1,
				Messages.GET_ENTERTAINMENT_SEARCH,
				findEntertainmentSearch
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

exports.deleteCommentByCommentId = async (req, res, next) => {
	try {
		const { commentId, entertainmentId } = req.query;

		const { userId } = req;

		const findComment = await entertainmentComments.findOne({
			_id: commentId,
			isActive: true,
			userId: userId,
		});

		if (findComment) {
			findComment.isActive = false;
			findComment.save();

			return getResponse(res, 200, 1, Messages.COMMENT_DELETED, {});
		} else {
			return getResponse(res, 200, 0, Messages.COMMENT_DATA_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
