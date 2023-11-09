const mongoose = require("mongoose");

const savedVideosAndArticles = mongoose.Schema(
	{
		isActive: { type: Boolean, default: true },
		livingId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "living",
			require: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			require: true,
		},
		isSaved: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

exports.savedVideosAndArticles = mongoose.model(
	"savedVideosAndArticles",
	savedVideosAndArticles
);
