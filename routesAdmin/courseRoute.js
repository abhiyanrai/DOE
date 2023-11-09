const express = require("express");
const courseController = require("../controllersAdmin/courseController");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const { check } = require("express-validator");
const { checker } = require("../middleware/bodyChecker");
const { Messages } = require("../utils/constant");
const router = express.Router();

router.get("/", (req, res, next) => {
	res.send("response from course route");
});

router.post(
	"/addCourses",
	isAuthAdmin,
	[
		check("courseTitle").notEmpty().withMessage(Messages.COURSE_NAME_REQUIRED),
		check("courseThumbnail")
			.notEmpty()
			.withMessage(Messages.COURSE_THUBNAIL_REQUIRED),
		check("publisher").notEmpty().withMessage(Messages.PUBLISHER_NAME_REQUIRED),
		check("content").notEmpty().withMessage(Messages.COURSE_CONTENT_REQUIRED),
	],
	checker,
	courseController.addCourses
);

router.post(
	"/addChaptersByCourseId",
	isAuthAdmin,
	[
		check("courseId").notEmpty().withMessage(Messages.COURSE_ID_REQUIRED_),
		check("courseChapter")
			.notEmpty()
			.withMessage(Messages.COURSE_CHAPTER_REQUIRED),
	],
	checker,
	courseController.addChaptersByCourseId
);

router.get(
	"/getAllCoursesAndChapterList",
	isAuthAdmin,
	courseController.getAllCoursesAndChapterList
);

router.get(
	"/getAllChaptersByCourseId",
	isAuthAdmin,
	courseController.getAllChaptersByCourseId
);

router.put(
	"/updateCourse",
	isAuthAdmin,
	check("id").notEmpty().withMessage(Messages.COURSE_ID_REQUIRED),
	checker,
	courseController.updateCourse
);

router.delete(
	"/deleteCourse",
	isAuthAdmin,
	check("id").notEmpty().withMessage(Messages.COURSE_ID_REQUIRED),
	checker,
	courseController.deleteCourse
);



router.put(
	"/updateCourseChapters",
	isAuthAdmin,
	check("id").notEmpty().withMessage(Messages.COURSE_ID_REQUIRED),
	checker,
	courseController.updateCourseChapters
);

router.get(
	"/getChaptersDetailsById",
	isAuthAdmin,
	courseController.getChaptersDetailsById
);

router.delete(
	"/deleteCourseChapter",
	isAuthAdmin,
	check("id").notEmpty().withMessage(Messages.CHAPTER_ID_REQUIRED),
	checker,
	courseController.deleteCourseChapter
)

router.post(
	"/addQuizQuestions",
	isAuthAdmin,
	[
		check("quesAndAns")
			.notEmpty()
			.withMessage(Messages.COURSE_THUBNAIL_REQUIRED),
		check("courseId").notEmpty().withMessage(Messages.COURSE_ID_REQUIRED),
	],
	checker,
	courseController.addQuizQuestions
);

router.put(
	"/updateQuizQuestions",
	isAuthAdmin,
	[
		check("quesAndAns")
			.notEmpty()
			.withMessage(Messages.COURSE_THUBNAIL_REQUIRED),
		check("courseId").notEmpty().withMessage(Messages.COURSE_ID_REQUIRED),
	],
	checker,
	courseController.updateQuizQuestions
);

router.delete(
	"/deleteQuizQuestions",
	isAuthAdmin,
	check("id").notEmpty().withMessage(Messages.quiz_question_id_required),
	checker,
	courseController.deleteQuizQuestions
);

router.get(
	"/getQuizDetailsByCourseId",
	isAuthAdmin,
	courseController.getQuizDetailsByCourseId
);

module.exports = router;
