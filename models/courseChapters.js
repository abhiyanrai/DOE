const mongoose = require("mongoose");

const courseChapters = new mongoose.Schema(
	{
		order: {
			type: Number, // Store the order as a number
		},
		chapterTitle: {
			type: String,
			require: true,
		},
		thumbnail: {
			type: String,
			default: "",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		videos: {
			type: String,
			default: "",
		},
		type: {
			type: String,
			default: "",
		},
		content: {
			type: String,
			default: "",
		},
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "courses",
			require: true,
		},
	},
	{ timestamps: true }
);

exports.courseChapters = mongoose.model("courseChapters", courseChapters);
