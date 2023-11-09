const mongoose = require("mongoose");

const wishList = new mongoose.Schema(
	{
		isActive: {
			type: Boolean,
			default: true,
		},
		shopId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "shops",
			required: true,
		},
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "products",
			require: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			require: true,
		},
	},
	{ timestamps: true }
);

exports.wishList = mongoose.model("wishList", wishList);
