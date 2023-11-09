const mongoose = require("mongoose");

const checkout = mongoose.Schema(
	{
		orderStatus: { type: String, default: "" },
		address: { type: String, default: "" },
		transactionID: { type: String, default: "" },
		paymentStatus: { type: String, default: "" },
		total: { type: Number, default: 0 },
		productDetails: {
			type: Array,
			require: true,
			default: { amount: 0, quantity: 0, productId: [] },
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
	},
	{ timestamps: true }
);

exports.checkout = mongoose.model("checkout", checkout);
