const mongoose = require("mongoose");

const livingHistory = mongoose.Schema(
	{
		livingId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "living",
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		isLike: { type: Boolean, default: false },
		isActive: { type: Boolean, default: true },
		message: { type: String, default: "" },
		recentPlayed: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

exports.livingHistory = mongoose.model("livingHistory", livingHistory);
