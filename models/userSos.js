const mongoose = require("mongoose");

const userSos = mongoose.Schema(
	{
		text: { type: String, default: "" },
		isActive: { type: Boolean, default: true },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		sosMessagesId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "sosMessages",
			required: true,
		},
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
		updatedAt: { type: Date, default: new Date() },
	},
	{ timestamps: true }
);

exports.userSos = mongoose.model("userSos", userSos);
