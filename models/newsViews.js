const moment = require("moment");
const mongoose = require("mongoose");

const newsViews = mongoose.Schema(
	{
		isActive: { type: Boolean, default: true },
		//createdAt: { type: Date, default: new Date() },, default: moment().format() },
		newsId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "news",
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

exports.newsViews = mongoose.model("newsViews", newsViews);
