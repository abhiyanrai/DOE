const mongoose = require("mongoose");

const myCart = new mongoose.Schema(
	{
		cartTotal: {
			type: String,
			default: "",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		productDetails: {
			type: Array,
			require: true,
			default: { amount: 0, quantity: 0, productId: "" },
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			require: true,
		},
	},
	{ timestamps: true }
);

exports.myCart = mongoose.model("myCart", myCart);
