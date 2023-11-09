const mongoose = require("mongoose");

const quizOptions = new mongoose.Schema(
	{
		options: {
			type: Object,
			default: {},
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		quizQuestionsId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "quizQuestions",
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

exports.quizOptions = mongoose.model("quizOptions", quizOptions);
