const mongoose = require("mongoose");

const newsRecentSearch = mongoose.Schema(
	{
		title: { type: String, require: true },
		isActive: { type: Boolean, default: true },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			require: true,
		},
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.newsRecentSearch = mongoose.model("newsRecentSearch", newsRecentSearch);
