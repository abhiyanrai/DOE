const mongoose = require("mongoose");

const livingComments = mongoose.Schema(
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
		isActive: { type: Boolean, default: true },
		message: { type: String, default: "" },
	},
	{ timestamps: true }
);

exports.livingComments = mongoose.model("livingComments", livingComments);
