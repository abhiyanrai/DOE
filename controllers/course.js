const { courses } = require("../models/courses");
const { courseChapters } = require("../models/courseChapters");
const { Messages } = require("../utils/constant");
const { quizQuestions } = require("../models/quizQuestions");
const { quizOptions } = require("../models/quizOptions");
const { courseRecentSearch } = require("../models/courseRecentSearch");
const { courseHistory } = require("../models/courseHistory");
const { User } = require("../models/users");
const { UserDetails } = require("../models/userDetails");
const { savedCourses } = require("../models/savedCourses");
const {
	calculateTimeDifference,
	removeDuplicates,
} = require("../utils/functions");
const { usersQuizScore } = require("../models/usersQuizScore");
const { courseComments } = require("../models/courseComments");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.getAllPopularCourses = async (req, res, next) => {
	try {
		const [findAllPopularCourses] = await Promise.all([
			courses
				.find({
					isActive: true,
					isPopular: true,
					isPublished: true,
				})
				.sort({ createdAt: -1 }),
		]);

		return getResponse(
			res,
			200,
			1,
			Messages.LIST_OF_POPULAR_COURSES,
			findAllPopularCourses
		);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllCoursesBanner = async (req, res, next) => {
	try {
		const [findAllCoursesBanner] = await Promise.all([
			courses
				.find({
					isActive: true,
					isBanner: true,
					isPublished: true,
				})
				.sort({ createdAt: -1 }),
		]);

		return getResponse(
			res,
			200,
			1,
			Messages.LIST_OF_COURSES_BANNER,
			findAllCoursesBanner
		);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllCoursesList = async (req, res, next) => {
	try {
		const { page, search, limit } = req.query;

		const skip = (page - 1) * limit;

		const [findAllCourses, findAllCoursesLength] = await Promise.all([
			courses
				.find({
					courseTitle: { $regex: search, $options: "i" },
					isActive: true,
					isPublished: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 }),
			courses
				.find({
					courseTitle: { $regex: search, $options: "i" },
					isActive: true,
					isPublished: true,
				})
				.sort({ createdAt: -1 }),
		]);
		return res.status(200).json({
			status: 1,
			message: "List of all courses",
			currentPage: page,
			totalLength: findAllCoursesLength.length,
			data: findAllCourses,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addCourseRecentSearch = async (req, res, next) => {
	try {
		const { userId } = req;
		const { title } = req.body;

		const findCourseRecentSearch = await courseRecentSearch.find({
			title: title,
			userId: userId,
		});

		if (findCourseRecentSearch.length > 0) {
			return getResponse(res, 200, 1, Messages.ADD_Course_SEARCH, {});
		}

		const addCourseRecentSearch = await courseRecentSearch.create({
			title: title,
			userId: userId,
		});

		if (addCourseRecentSearch) {
			return getResponse(res, 200, 1, Messages.ADD_Course_SEARCH, {});
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

exports.getAllCoursesRecentSearches = async (req, res, next) => {
	try {
		const { userId } = req;

		const findCourseRecentSearch = await courseRecentSearch
			.find({
				userId: userId,
				isActive: true,
			})
			.limit(10);

		if (findCourseRecentSearch.length > 0) {
			return getResponse(
				res,
				200,
				1,
				Messages.GET_Course_SEARCH,
				findCourseRecentSearch
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

exports.addCommentOnCourseChapter = async (req, res, next) => {
	try {
		const { courseId, chapterId, comment } = req.body;
		const { userId } = req;

		const findCourse = await courses.findOne({
			_id: courseId,
			isActive: true,
			isPublished: true,
		});

		if (findCourse) {
			const findHistory = await courseHistory.findOne({
				userId: userId,
				courseId: courseId,
				courseChapterId: chapterId,
			});
			if (findHistory) {
				const addComment = await courseComments.create({
					userId: userId,
					courseId: courseId,
					courseChapterId: chapterId,
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
			return getResponse(res, 200, 0, Messages.COURSE_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.viewCourseChapter = async (req, res, next) => {
	try {
		const { courseId, chapterId } = req.body;
		const { userId } = req;

		const findCourse = await courses.findOne({
			_id: courseId,
			isActive: true,
			isPublished: true,
		});

		if (findCourse) {
			const findChapterById = await courseChapters.findOne({
				courseId: courseId,
				_id: chapterId,
				isActive: true,
			});

			if (findChapterById) {
				const findHistory = await courseHistory.findOne({
					userId: userId,
					courseId: courseId,
					courseChapterId: chapterId,
				});

				if (!findHistory) {
					const createHistory = await courseHistory.create({
						userId: userId,
						courseId: courseId,
						courseChapterId: chapterId,
						recentPlayed: true,
					});

					if (createHistory) {
						return getResponse(res, 200, 1, Messages.VIEW_Chapters_, "");
					} else {
						return res
							.status(500)
							.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
					}
				} else {
					return getResponse(res, 200, 0, Messages.ALREADY_VIEWED, "");
				}
			} else {
				return getResponse(res, 400, 0, Messages.CHAPTER_DETAILS_NOT_FOUND, "");
			}
		} else {
			return res
				.status(400)
				.json({ status: 0, message: Messages.COURSE_NOT_FOUND });
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.likeOrUnlikeCourseChapter = async (req, res, next) => {
	try {
		const { courseId, chapterId, isLike } = req.body;
		const { userId } = req;

		const findCourse = await courses.findOne({
			_id: courseId,
			isActive: true,
			isPublished: true,
		});

		if (findCourse) {
			const findChapterById = await courseChapters.findOne({
				courseId: courseId,
				_id: chapterId,
				isActive: true,
			});
			if (findChapterById) {
				const findHistory = await courseHistory.findOne({
					userId: userId,
					courseId: courseId,
					courseChapterId: chapterId,
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
				return getResponse(res, 200, 0, Messages.CHAPTERS_DATA_NOT_FOUND, {});
			}
		} else {
			return getResponse(res, 200, 0, Messages.COURSE_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllCourseChaptersById = async (req, res, next) => {
	try {
		const { courseId, chapterId } = req.query;
		const { userId } = req;
		const findCoursesById = await courses.find({
			_id: courseId,
			isActive: true,
			isPublished: true,
		});

		if (findCoursesById.length > 0) {
			let query = {
				courseId: courseId,
				isActive: true,
			};

			if (chapterId != undefined && chapterId != "") {
				query._id = chapterId;
			}

			const findFirstChapter = await courseChapters.findOne(query).lean();

			if (!findFirstChapter) {
				return getResponse(res, 200, 0, Messages.CHAPTERS_DATA_NOT_FOUND, []);
			}

			const findAllChapter = await courseChapters.find({
				courseId: courseId,
				isActive: true,
				_id: { $ne: findFirstChapter._id },
			});

			const findAllLikes = await courseHistory.count({
				courseId: courseId,
				courseChapterId: findFirstChapter._id,
				isLike: true,
			});

			const findAllComments = await courseComments.count({
				courseId: courseId,
				courseChapterId: findFirstChapter._id,
				message: { $ne: "" },
			});

			const findMyLikes = await courseHistory.findOne({
				userId: userId,
				courseId: courseId,
				courseId: findFirstChapter._id,
				isLike: true,
			});
			const findAllViews = await courseHistory.count({
				courseId: courseId,
				courseChapterId: findFirstChapter._id,
			});

			findFirstChapter.totalViews = findAllViews;
			findFirstChapter.totalLikes = findAllLikes;
			findFirstChapter.myLike = Boolean(findMyLikes);
			findFirstChapter.totalComments = findAllComments;

			return getResponse(res, 200, 1, Messages.CHAPTER_DATA_FETCHED, {
				firstChapter: findFirstChapter,
				allChapter: findAllChapter,
			});
		} else {
			return getResponse(res, 200, 0, Messages.COURSE_NOT_FOUND, []);
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: course.js:374 ~ exports.getAllCourseChaptersById= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllChapterCommentsById = async (req, res, next) => {
	try {
		const { chapterId, courseId } = req.query;

		const findCourse = await courses.findOne({
			_id: courseId,
			isActive: true,
			isPublished: true,
		});

		if (findCourse) {
			let arr = [];

			const findChapterById = await courseChapters.findOne({
				courseId: courseId,
				_id: chapterId,
				isActive: true,
			});

			if (findChapterById) {
				const findHistory = await courseComments
					.find({
						courseId: courseId,
						courseChapterId: chapterId,
						message: { $ne: "" },
					})
					.lean();

				if (findHistory.length > 0) {
					const uniqueIds = removeDuplicates(findHistory, "userId");

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

					const userProfiles = await UserDetails.find({
						userId: { $in: uniqueIds },
					});

					for (let index = 0; index < findHistory.length; index++) {
						const element = findHistory[index];
						const isUserExist = isAllUserExist.find((i) =>
							i._id.equals(element.userId)
						);

						if (isUserExist) {
							const userProfile = userProfiles.find((i) =>
								i.userId.equals(element.userId)
							);
							isUserExist.profile = userProfile ? userProfile.profile : "";
							element.userDetails = isUserExist;
							arr.push(element);
						}
					}
					return getResponse(res, 200, 1, Messages.COMMENT_FETCHED, arr);
				} else {
					return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
				}
			} else {
				return getResponse(res, 200, 0, Messages.CHAPTERS_DATA_NOT_FOUND, []);
			}
		} else {
			return getResponse(res, 200, 0, Messages.COURSE_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.savedUnsavedCourse = async (req, res, next) => {
	try {
		const { userId } = req;
		const { courseId, isSaved } = req.body;

		const findUser = await User.findOne({ _id: userId, isActive: true });

		if (findUser) {
			const findCourse = await courses.findOne({
				_id: courseId,
				isActive: true,
				isPublished: true,
			});
			if (findCourse) {
				let msg =
					isSaved == true
						? Messages.COURSE_SAVED_TO_LIST
						: Messages.REMOVE_SAVED_COURSE;

				const findSavedCourse = await savedCourses.findOne({
					courseId: courseId,
					userId: userId,
					isActive: true,
				});
				if (findSavedCourse) {
					findSavedCourse.isActive = isSaved;
					findSavedCourse.save();

					return getResponse(res, 200, 1, msg);
				} else {
					const addSavedCourse = new savedCourses({
						courseId: courseId,
						userId: userId,
					});
					await addSavedCourse.save();
					return getResponse(res, 200, 1, msg, "");
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

exports.getAllUserSavedCourses = async (req, res, next) => {
	try {
		const { userId } = req;
		const { search } = req.query;

		const findSavedCourse = await savedCourses
			.find({
				userId: userId,
				isActive: true,
				isSaved: true,
			})
			.sort({ createdAt: -1 })
			.lean();

		if (findSavedCourse.length > 0) {
			const data = [];

			const uniqueIds = removeDuplicates(findSavedCourse, "courseId");

			const findAllCourse = await courses.find({
				_id: { $in: uniqueIds },
				isActive: true,
				isPublished: true,
			});

			const countAllViews = await courseHistory.find({
				courseId: { $in: uniqueIds },
				isActive: true,
			});

			for (let obj of findSavedCourse) {
				const findCourse = findAllCourse.find((i) =>
					i._id.equals(obj.courseId)
				);

				if (findCourse && findCourse.courseTitle.indexOf(search) !== -1) {
					const countViews = countAllViews.filter((i) =>
						i.courseId.equals(obj.courseId)
					);

					obj.totalViewCount = countViews.length;
					obj.time = calculateTimeDifference(obj.createdAt);
					obj.findCourseDetails = findCourse;
					data.push(obj);
				}
			}

			return getResponse(res, 200, 1, Messages.COURSE_SAVED_DATA, data);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllQuizDetailsByCourseId = async (req, res, next) => {
	try {
		const { courseId } = req.query;

		const findCourseById = await courses.find({
			_id: courseId,
			isActive: true,
			isPublished: true,
		});

		if (findCourseById.length > 0) {
			const getQnA = await quizQuestions
				.find({
					courseId: courseId,
					isActive: true,
				})
				.lean();

			if (getQnA.length > 0) {
				const uniqueIds = removeDuplicates(getQnA, "_id");

				const findAllOptions = await quizOptions.find({
					courseId: courseId,
					isActive: true,
					quizQuestionsId: { $in: uniqueIds },
				});

				getQnA.map((e) => {
					const findOptions = findAllOptions.filter((i) =>
						i.quizQuestionsId.equals(e._id)
					);
					e.options = findOptions.length > 0 ? findOptions[0] : {};
					return e;
				});
			}

			return getResponse(res, 200, 1, Messages.CHAPTER_DATA_FETCHED, getQnA);
		} else {
			return getResponse(res, 200, 0, Messages.CHAPTER_DETAILS_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.saveQuizAnswer = async (req, res, next) => {
	try {
		const { courseId, quizQuestionId, answer } = req.body;
		const { userId } = req;
		const findCourseById = await courses.find({
			_id: courseId,
			isActive: true,
			isPublished: true,
		});

		if (findCourseById.length > 0) {
			const getQnA = await quizQuestions.findOne({
				courseId: courseId,
				_id: quizQuestionId,
				isActive: true,
			});

			if (getQnA) {
				if (getQnA.ans == answer) {
					const findUserQuizScore = await usersQuizScore.findOne({
						courseId: courseId,
						quizQuestionId: quizQuestionId,
						userId: userId,
					});

					if (!findUserQuizScore) {
						const addUserQuizScore = await usersQuizScore.create({
							correctAns: 1,
							wrongAns: 0,
							courseId: courseId,
							quizQuestionId: quizQuestionId,
							score: 1,
							userId: userId,
						});
						return getResponse(res, 200, 1, Messages.QUIZ_ANSWER_RIGHT, "");
					} else {
						return getResponse(res, 200, 0, Messages.QUIZ_ANSWER, "");
					}
				} else {
					const findUserQuizScore = await usersQuizScore.findOne({
						courseId: courseId,
						quizQuestionId: quizQuestionId,
						userId: userId,
					});
					if (!findUserQuizScore) {
						const addUserQuizScore = await usersQuizScore.create({
							correctAns: 0,
							wrongAns: 1,
							courseId: courseId,
							quizQuestionId: quizQuestionId,
							score: -1,
							userId: userId,
						});
						return getResponse(res, 200, 1, Messages.QUIZ_ANSWER_WRONG, "");
					} else {
						return getResponse(res, 200, 0, Messages.QUIZ_ANSWER, "");
					}
				}
			} else {
				return getResponse(res, 200, 0, Messages.QUIZ_QUESTION_NOT_FOUND, "");
			}
		} else {
			return getResponse(res, 200, 0, Messages.CHAPTER_DETAILS_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getQuizResult = async (req, res, next) => {
	try {
		const { courseId } = req.query;
		const { userId } = req;
		const findCourseById = await courses.find({
			_id: courseId,
			isActive: true,
			isPublished: true,
		});

		if (findCourseById.length > 0) {
			const getTotalQnA = await quizQuestions.count({
				courseId: courseId,
				isActive: true,
			});

			if (getTotalQnA >= 1) {
				const countCorrectAnswer = await usersQuizScore.count({
					courseId: courseId,
					correctAns: 1,
					userId: userId,
				});

				const countWrongAnswer = await usersQuizScore.count({
					courseId: courseId,
					wrongAns: 1,
					userId: userId,
				});

				let sum = getTotalQnA == countCorrectAnswer + countWrongAnswer;

				if (sum) {
					let percentage = parseInt((countCorrectAnswer / getTotalQnA) * 100);
					return getResponse(res, 200, 1, Messages.QUIZ_COMPLETED, {
						totalQuestions: getTotalQnA,
						totalCorrectAnswer: countCorrectAnswer,
						totalWrongAnswer: countWrongAnswer,
						percentage,
					});
				} else {
					return getResponse(res, 200, 0, Messages.QUIZ_NOT_COMPLETED, "");
				}
			} else {
				return getResponse(res, 400, 0, Messages.QUIZ_NOT_FOUND, "");
			}
		} else {
			return getResponse(res, 400, 0, Messages.CHAPTER_DETAILS_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
