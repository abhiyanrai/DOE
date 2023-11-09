const mongoose = require("mongoose");

const userNewsHistory = mongoose.Schema(
	{
		isActive: { type: Boolean, default: true },
		newsId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "news",
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		// isSaved: { type: Boolean, default: false },
		recentlyPlayed: { type: Boolean, default: true },
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.userNewsHistory = mongoose.model("userNewsHistory", userNewsHistory);
