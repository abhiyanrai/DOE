const mongoose = require("mongoose");

const savedCourses = mongoose.Schema(
	{
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "courses",
			require: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			require: true,
		},
		isSaved: { type: Boolean, default: false },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

exports.savedCourses = mongoose.model("savedCourses", savedCourses);
