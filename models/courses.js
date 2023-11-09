const mongoose = require("mongoose");

const courses = new mongoose.Schema(
	{
		courseTitle: {
			type: String,
			require: true,
		},
		courseThumbnail: {
			type: String,
			default: "",
		},
		content: {
			type: String,
			default: "",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		publisher: {
			type: String,
			default: "",
		},
		isBanner: {
			type: Boolean,
			default: false,
		},
		isPopular: {
			type: Boolean,
			default: false,
		},
		isPublished: {
			type: Boolean,
			default: false,
		},
		videoTimeDuration: {
			type: String,
			default: "00:00:00",
		},
	},
	{ timestamps: true }
);

exports.courses = mongoose.model("courses", courses);
