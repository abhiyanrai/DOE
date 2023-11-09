const mongoose = require("mongoose");

const entertainment = mongoose.Schema(
	{
		title: { type: String, required: true },
		subtitle: { type: String, default: "" },
		content: { type: String, default: "" },
		isActive: { type: Boolean, default: true },
		thumbnail: { type: String, default: "" },
		contentSource: { type: String, default: "" },
		creatorName: { type: String, default: "" },
		publishDate: { type: String, default: "" },
		type: { type: String, required: true },
		video: { type: String, default: "" },
		isBanner: { type: Boolean, default: false },
		isPublish: { type: Boolean, default: false },
		videoTimeDuration: { type: String, default: "00:00:00" },
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.entertainment = mongoose.model("entertainment", entertainment);
