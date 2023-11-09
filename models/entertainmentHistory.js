const mongoose = require("mongoose");

const entertainmentHistory = mongoose.Schema(
	{
		entertainmentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "entertainment",
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
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.entertainmentHistory = mongoose.model(
	"entertainmentHistory",
	entertainmentHistory
);
