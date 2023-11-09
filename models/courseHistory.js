const mongoose = require("mongoose");

const courseHistory = mongoose.Schema(
	{
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "courses",
			required: true,
		},
		courseChapterId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "courseChapters",
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		isLike: { type: Boolean, default: false },
		isActive: { type: Boolean, default: true },
		message: { type: String, default: "" },
		recentPlayed: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

exports.courseHistory = mongoose.model("courseHistory", courseHistory);
