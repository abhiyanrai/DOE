const mongoose = require("mongoose");

const quizQuestions = new mongoose.Schema(
	{
		order: {
			type: Number, // Store the order as a number
		},
		ques: {
			type: String,
			require: true,
		},
		ans: {
			type: String,
			default: "",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "courses",
			require: true,
		},
	},
	{ timestamps: true }
);

exports.quizQuestions = mongoose.model("quizQuestions", quizQuestions);
