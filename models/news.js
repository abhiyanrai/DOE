const mongoose = require("mongoose");

const news = mongoose.Schema(
	{
		isActive: { type: Boolean, default: true },
		newsTitle: { type: String, default: "" },
		newsHeading: { type: String, default: "" },
		newsContent: { type: String, default: "" },
		thumbnail: { type: String, default: "" },
		onPriority: { type: Boolean, default: false },
		publishDate: { type: String, default: "" },
		newsSource: { type: String, default: "" },
		publishBy: { type: String, default: "" },
		video: { type: String, default: "" },
		type: { type: String, default: "" },
		isBanner: { type: Boolean, default: false },
		isPublished: { type: Boolean, default: false },
		videoTimeDuration: { type: String, default: "00:00:00" },
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.news = mongoose.model("news", news);
