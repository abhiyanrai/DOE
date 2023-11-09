const mongoose = require("mongoose");

const courseComments = mongoose.Schema(
	{
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "courses",
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		courseChapterId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "courseChapters",
			required: true,
		},
		isActive: { type: Boolean, default: true },
		message: { type: String, default: "" },
	},
	{ timestamps: true }
);

exports.courseComments = mongoose.model("courseComments", courseComments);
