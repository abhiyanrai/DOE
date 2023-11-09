const mongoose = require("mongoose");

const savedNews = mongoose.Schema(
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
		isSaved: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

exports.savedNews = mongoose.model("savedNews", savedNews);
