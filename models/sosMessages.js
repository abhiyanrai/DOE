const mongoose = require("mongoose");

const sosMessages = mongoose.Schema(
	{
		name: { type: String, default: "" },
		isActive: { type: Boolean, default: true },
		userId: { type: String, default: "" },
		addedBy: { type: String, default: "Admin" },
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.sosMessages = mongoose.model("sosMessages", sosMessages);
