const mongoose = require("mongoose");

const usersQuizScore = new mongoose.Schema(
	{
		correctAns: {
			type: Number,
			default: 0,
		},
		wrongAns: {
			type: Number,
			default: 0,
		},
		score: {
			type: Number,
			default: 0,
		},
		quizQuestionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "quizQuestions",
			require: true,
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
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			require: true,
		},
	},
	{ timestamps: true }
);

exports.usersQuizScore = mongoose.model("usersQuizScore", usersQuizScore);
