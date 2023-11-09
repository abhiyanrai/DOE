const { courses } = require("../models/courses");
const { courseChapters } = require("../models/courseChapters");
const { Messages } = require("../utils/constant");
const { quizQuestions } = require("../models/quizQuestions");
const { quizOptions } = require("../models/quizOptions");
// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.addCourses = async (req, res, next) => {
	try {
		const {
			courseTitle,
			courseThumbnail,
			publisher,
			isBanner,
			isPopular,
			content,
			videoTimeDuration,
			isPublished,
		} = req.body;

		const findCourses = await courses.find({
			courseTitle: courseTitle,
			isActive: true,
		});
		if (findCourses.length > 0) {
			return getResponse(res, 409, 0, Messages.COURSE_NAME_ALREADY_EXIST, {});
		} else {
			const addCourse = await courses.create({
				courseTitle,
				courseThumbnail,
				publisher,
				isBanner,
				isPopular,
				content,
				videoTimeDuration,
				isPublished,
			});

			if (addCourse) {
				return getResponse(res, 200, 1, Messages.COURSE_ADDED, addCourse);
			} else {
				return getError(res, 500, {
					status: 0,
					message: Messages.SOMETHING_WENT_WRONG,
				});
			}
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: courseController.js:43 ~ exports.addCourses= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addChaptersByCourseId = async (req, res, next) => {
	try {
		const { courseId, courseChapter } = req.body;

		const findCourses = await courses.findOne({
			_id: courseId,
			isActive: true,
		});
		if (findCourses.length == 0) {
			return getResponse(res, 400, 0, Messages.COURSE_NOT_FOUND, {});
		} else {
			const courseChapterArr = courseChapter.map(async (item) => {
				return await courseChapters.create({
					...item,
					courseId: findCourses._id,
				});
			});

			let data = await Promise.all(courseChapterArr);

			return getResponse(res, 200, 1, Messages.COURSE_CHAPTERS_ADDED, {
				...findCourses._doc,
				courseChapter: data,
			});
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: courseController.js:43 ~ exports.addCourses= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllCoursesAndChapterList = async (req, res, next) => {
	try {
		const { page, search, limit } = req.query;

		const skip = (page - 1) * limit;

		const [findAllCourses, findAllCoursesLength] = await Promise.all([
			courses
				.find({
					courseTitle: { $regex: search, $options: "i" },
					isActive: true,
				})
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 })
				.lean(),
			courses.find({
				courseTitle: { $regex: search, $options: "i" },
				isActive: true,
			}),
		]);

		const mapArr = findAllCourses.map(async (jsonData) => {
			const findChapter = await courseChapters.find({
				courseId: jsonData._id,
				isActive: true,
			});

			jsonData.courseChapter = findChapter;

			return jsonData;
		});

		let data = await Promise.all(mapArr);

		return res.status(200).json({
			status: 1,
			message: "List of all courses and chapter",
			currentPage: page,
			totalLength: findAllCoursesLength.length,
			data: data,
		});

		// const findAllCourses = await courses
		// 	.aggregate([
		// 		{
		// 			$lookup: {
		// 				from: "coursechapters", // Name of the second collection (lowercase and pluralized)
		// 				localField: "_id", // Field in the first collection to match
		// 				foreignField: "courseId", // Field in the second collection to match
		// 				as: "courseChapters", // Output field name for the joined data
		// 			},
		// 		},
		// 		{
		// 			$limit: parseInt(limit),
		// 		},
		// 		{
		// 			$skip: (page - 1) * limit,
		// 		},
		// 		// {
		// 		// 	$match: {
		// 		// 		$or: [
		// 		// 			// { courseTitle: { $regex: "%" + search + "%", $options: "i" } },
		// 		// 		],
		// 		// 	},
		// 		// },
		// 	])
		// 	.exec();
	} catch (error) {
		console.log(
			"🚀 ~ file: courseController.js:111 ~ exports.getAllCoursesAndChapterList= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllChaptersByCourseId = async (req, res, next) => {
	try {
		const { courseId } = req.query;

		const findCoursesById = await courses.find({
			_id: courseId,
			isActive: true,
		});

		if (findCoursesById.length > 0) {
			const findAllChapter = await courseChapters.find({
				courseId: courseId,
				isActive: true,
			}).sort({ order: 1});
			
			return getResponse(
				res,
				200,
				1,
				Messages.CHAPTER_DATA_FETCHED,
				findAllChapter
			);
		} else {
			return getResponse(res, 200, 0, Messages.COURSE_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateCourse = async (req, res, next) => {
	try {
		const {
			id,
			courseTitle,
			courseThumbnail,
			publisher,
			isBanner,
			isPopular,
			content,
			videoTimeDuration,
			isPublished,
		} = req.body;

		const findCoursesById = await courses.findOne({
			_id: id,
			isActive: true,
		});
		if (findCoursesById) {
			let params = {};

			if (courseTitle) {
				params.courseTitle = courseTitle;
			}
			if (courseThumbnail) {
				params.courseThumbnail = courseThumbnail;
			}
			if (content) {
				params.content = content;
			}
			if (publisher) {
				params.publisher = publisher;
			}
			if (isBanner) {
				params.isBanner = isBanner;
			}

			if (isPopular) {
				params.isPopular = isPopular;
			}

			if (videoTimeDuration) {
				params.videoTimeDuration = videoTimeDuration;
			}

			if (isPublished) {
				params.isPublished = isPublished;
			}

			const filter = {
				_id: id,
				isActive: true,
			};

			await courses.findOneAndUpdate(filter, params);

			return getResponse(res, 200, 1, Messages.COURSE_DETAILS_UPDATED, {});
		} else {
			return getResponse(res, 400, 0, Messages.COURSE_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteCourse = async (req, res, next) => {
	try {
		const { id } = req.query;

		const findCoursesById = await courses.findOne({
			_id: id,
			isActive: true,
		});
		if (findCoursesById) {
			const filter = {
				_id: id,
				isActive: true,
			};

			await courses.findOneAndUpdate(filter, { isActive: false });

			return getResponse(res, 200, 1, Messages.COURSE_DELETED, {});
		} else {
			return getResponse(res, 400, 0, Messages.COURSE_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};



exports.deleteCourseChapter = async (req, res, next) => {
	
	try {
		const { id } = req.query;

		const findChapterById = await courseChapters.findOne({
			_id: id,
			isActive: true,
		});
		if (findChapterById) {
			const filter = {
				_id: id,
				isActive: true,
			};

			await courseChapters.findOneAndUpdate(filter, { isActive: false });

			return getResponse(res, 200, 1, Messages.CHAPTER_CHAPTERS_DELETED, {});
		} else {
			return getResponse(res, 400, 0, Messages.CHAPTER_DETAILS_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateCourseChapters = async (req, res, next) => {
	try {
		const { id, courseChapter } = req.body;

		const findCoursesById = await courses.findOne({
			_id: id,
			isActive: true,
		});
		if (findCoursesById) {
			const filter = {
				courseId: id,
				isActive: true,
			};

			await courseChapters.updateMany(filter, { isActive: false });

			const chaptersWithOrder = courseChapter.map((item, index) => {
				return {
				  ...item,
				  courseId: id,
				  order: index + 1, 
				};
			  });
		
			  await courseChapters.insertMany(chaptersWithOrder);
		

			return getResponse(res, 200, 1, Messages.COURSE_CHAPTERS_UPDATED, {});
		} else {
			return getResponse(res, 400, 0, Messages.COURSE_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getChaptersDetailsById = async (req, res, next) => {
	try {
		const { id } = req.query;

		const findChapterById = await courseChapters.find({
			_id: id,
			isActive: true,
		});

		if (findChapterById.length > 0) {
			return getResponse(
				res,
				200,
				1,
				Messages.CHAPTER_DATA_FETCHED,
				findChapterById
			);
		} else {
			return getResponse(res, 200, 0, Messages.CHAPTER_DETAILS_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addQuizQuestions = async (req, res, next) => {
	try {
		const { courseId, quesAndAns } = req.body;

		const findCourses = await courses.find({
			_id: courseId,
			isActive: true,
		});

		if (findCourses.length == 0) {
			return getResponse(res, 400, 0, Messages.COURSE_NOT_FOUND, {});
		} else {
			const addQuesAndAns = quesAndAns.map(async (item) => {
				const filter = {
					courseId: courseId,
					isActive: true,
				};

				const params = { isActive: false };

				// await quizQuestions.findOneAndUpdate(filter, params);

				const addQnA = await quizQuestions.create({
					ques: item.questions,
					ans: item.correctAnswer,
					courseId: courseId,
				});

				const addOptions = await quizOptions.create({
					options: item.answer,
					courseId: courseId,
					quizQuestionsId: addQnA._id,
				});

				return { ...addQnA._doc, addOptions };
			});

			Promise.all(addQuesAndAns)
				.then((data) => {
					return getResponse(res, 200, 1, Messages.QUIZ_ADDED, data);
				})
				.catch((err) => {
					return getError(res, 500, {
						status: 0,
						message: Messages.SOMETHING_WENT_WRONG,
					});
				});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateQuizQuestions = async (req, res, next) => {
	try {
	  const { courseId, quesAndAns } = req.body;
  
	  const findCourses = await courses.find({
		_id: courseId,
		isActive: true,
	  });
  
	  if (findCourses.length === 0) {
		return getResponse(res, 400, 0, Messages.COURSE_NOT_FOUND, {});
	  } else {
		const updatedQuesAndAns = await Promise.all(
			
		  quesAndAns.map(async (item, index) => {
			const filter = {
			  courseId: courseId,
			  _id: item._id,
			  isActive: true,
			};
  
			const updateFields = {
			  ques: item.ques,
			  ans: item.ans,
			  order: index + 1,
			};
  
			const existingQuestion = await quizQuestions.findOne(filter);
  
			if (existingQuestion) {
			  await quizQuestions.updateOne(filter, updateFields);
			  return {
				id: item._id,
				...updateFields,
			  };
			}
			
			return null;
		  })
		);
  

		const filteredUpdatedQuesAndAns = updatedQuesAndAns.filter(
		  (item) => item !== null
		);
		console.log(filteredUpdatedQuesAndAns, "UUUu")
  
		return getResponse(
		  res,
		  200,
		  1,
		  Messages.QUIZ_UPDATED,
		  filteredUpdatedQuesAndAns
		);
	  }
	} catch (error) {
	  return res
		.status(500)
		.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
  };
  

exports.deleteQuizQuestions = async (req, res, next) => {
  try {
    const { id: quizQuestionId } = req.query;

    const quizQuestion = await quizQuestions.findOne({
      _id: quizQuestionId,
      isActive: true,
    });
    
    if (!quizQuestion) {
      return getResponse(res, 400, 0, Messages.QUIZ_QUESTION_NOT_FOUND, {});
    }

 
    await quizQuestions.updateOne({ _id: quizQuestionId }, { isActive: false });

   
    await quizOptions.updateMany(
      { quizQuestionsId: quizQuestionId },
      { isActive: false }
    );

    return getResponse(res, 200, 1, Messages.QUIZ_QUESTION_DELETED, {});
  } catch (error) {
    return getError(res, 500, {
      status: 0,
      message: Messages.SOMETHING_WENT_WRONG,
    });
  }
};



exports.getQuizDetailsByCourseId = async (req, res, next) => {
	try {
		const { courseId } = req.query;

		const findCourseById = await courses.findOne({
			_id: courseId,
			isActive: true,
		});

		if (!findCourseById) {
			return getResponse(res, 400, 0, Messages.COURSE_NOT_FOUND, []);
		}

		const getQnA = await quizQuestions.find({
			courseId: courseId,
			isActive: true,
		}).sort({ order: 1 }); // Sort by order if you have an order field

		const mapArr = getQnA.map(async (e) => {
			const data = JSON.parse(JSON.stringify(e));
			const findOptions = await quizOptions.findOne({
				courseId: courseId,
				quizQuestionsId: e._id,
			});
			data.options = findOptions;
			return data;
		});

		const data = await Promise.all(mapArr);

		return getResponse(res, 200, 1, Messages.QUIZ_DATA_FETCHED, data);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

