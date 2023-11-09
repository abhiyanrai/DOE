const mongoose = require("mongoose");

const entertainmentComments = mongoose.Schema(
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
		isActive: { type: Boolean, default: true },
		message: { type: String, default: "" },
	},
	{ timestamps: true }
);

exports.entertainmentComments = mongoose.model(
	"entertainmentComments",
	entertainmentComments
);
