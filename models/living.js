const mongoose = require("mongoose");

const living = mongoose.Schema(
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
		isPopular: { type: Boolean, default: false },
		isPublish: { type: Boolean, default: false },
		videoTimeDuration: { type: String, default: "00:00:00" },
	},
	{ timestamps: true }
);

exports.living = mongoose.model("living", living);
