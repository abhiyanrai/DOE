const express = require("express");
const courseController = require("../controllers/course");
const isAuthUser = require("../middleware/isAuthUser");
const { check } = require("express-validator");
const { checker } = require("../middleware/bodyChecker");
const { Messages } = require("../utils/constant");
const router = express.Router();

router.get("/", (req, res, next) => {
	res.send("response from course route");
});

router.get(
	"/getAllPopularCourses",
	isAuthUser,
	courseController.getAllPopularCourses
);

router.get(
	"/getAllCoursesBanner",
	isAuthUser,
	courseController.getAllCoursesBanner
);

router.get(
	"/getAllCoursesList",
	isAuthUser,
	courseController.getAllCoursesList
);

router.post(
	"/addCourseRecentSearch",
	isAuthUser,
	check("title").notEmpty().withMessage(Messages.TITLE_REQUIRED),
	checker,
	courseController.addCourseRecentSearch
);

router.get(
	"/getAllCoursesRecentSearches",
	isAuthUser,
	courseController.getAllCoursesRecentSearches
);

router.post(
	"/addCommentOnCourseChapter",
	isAuthUser,
	check("comment").notEmpty().withMessage(Messages.COMMENT_REQUIRED),
	checker,
	courseController.addCommentOnCourseChapter
);

router.post(
	"/viewCourseChapter",
	[
		check("courseId").notEmpty().withMessage(Messages._COURSE_ID_REQUIRED),
		check("chapterId").notEmpty().withMessage(Messages.CHAPTER_ID_REQUIRED),
	],
	checker,
	isAuthUser,
	courseController.viewCourseChapter
);

router.post(
	"/likeOrUnlikeCourseChapter",
	[
		check("courseId").notEmpty().withMessage(Messages._COURSE_ID_REQUIRED),
		check("chapterId").notEmpty().withMessage(Messages.CHAPTER_ID_REQUIRED),
	],
	checker,
	isAuthUser,
	courseController.likeOrUnlikeCourseChapter
);

router.get(
	"/getAllCourseChaptersById",
	isAuthUser,
	courseController.getAllCourseChaptersById
);

router.get(
	"/getAllChapterCommentsById",
	isAuthUser,
	courseController.getAllChapterCommentsById
);

router.post(
	"/savedUnsavedCourse",
	[
		check("courseId").notEmpty().withMessage(Messages._COURSE_ID_REQUIRED),
		check("isSaved").notEmpty().withMessage(Messages.ISSAVED_REQUIRED),
	],
	checker,
	isAuthUser,
	courseController.savedUnsavedCourse
);

router.get(
	"/getAllUserSavedCourses",
	isAuthUser,
	courseController.getAllUserSavedCourses
);

router.get(
	"/getAllQuizDetailsByCourseId",
	isAuthUser,
	courseController.getAllQuizDetailsByCourseId
);

router.post(
	"/saveQuizAnswer",
	[
		check("courseId").notEmpty().withMessage(Messages._COURSE_ID_REQUIRED),
		check("quizQuestionId")
			.notEmpty()
			.withMessage(Messages.quiz_question_id_required),
		check("answer").notEmpty().withMessage(Messages.ANSWER_REQUIRED),
	],
	checker,
	isAuthUser,
	courseController.saveQuizAnswer
);

router.get("/getQuizResult", isAuthUser, courseController.getQuizResult);

module.exports = router;
