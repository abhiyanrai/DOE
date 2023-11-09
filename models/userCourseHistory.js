const mongoose = require("mongoose");

const userCourseHistory = new mongoose.Schema(
	{
		messages: {
			type: String,
			default: "",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isLike: {
			type: Boolean,
			default: false,
		},
		isLearned: {
			type: Boolean,
			default: false,
		},
		courseChaptersId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "courseChapters",
			require: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			require: true,
		},
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "courses",
			require: true,
		},
	},
	{ timestamps: true }
);

exports.userCourseHistory = mongoose.model(
	"userCourseHistory",
	userCourseHistory
);
