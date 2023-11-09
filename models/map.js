const moment = require("moment");
const mongoose = require("mongoose");

const map = new mongoose.Schema(
	{
		name: { type: String, default: "" },
		address: { type: String, default: "" },
		image: { type: String, default: "" },
		latitude: { type: String, default: "" },
		longitude: { type: String, default: "" },
		status: { type: String, require: true },
		isActive: { type: Boolean, default: true },
		isPinned: { type: Boolean, default: false },
		userId: { type: String, default: "" },
		// //createdAt: { type: Date, default: new Date() },, default: moment().format() },
	},
	{ timestamps: true }
);

exports.map = mongoose.model("map", map);
