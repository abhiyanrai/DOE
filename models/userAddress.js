const mongoose = require("mongoose");

const userAddress = mongoose.Schema(
	{
		addressType: { type: String, default: "" },
		fullName: { type: String, default: "" },
		phone: { type: String, default: "" },
		state: { type: String, default: "" },
		city: { type: String, default: "" },
		zipCode: { type: String, default: "" },
		country: { type: String, default: "" },
		address: { type: String, default: "" },
		landmark: { type: String, default: "" },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
	},
	{ timestamps: true }
);

exports.userAddress = mongoose.model("userAddress", userAddress);
