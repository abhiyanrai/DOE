const mongoose = require("mongoose");

const Products = new mongoose.Schema(
	{
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "usersAdmin",
		},
		name: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			required: true,
		},
		subcategory: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		discount: {
			type: Number,
			default: 0,
		},
		productImage: {
			type: [String],
			required: true,
		},
		desc: {
			type: String,
			required: true,
		},
		size: {
			type: String,
			required: true,
		},
		color: {
			type: String,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		shopId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "shops",
			required: true,
		},
		status: {
			type: String,
			enum: ["In stock", "Sold out", "Available", "Not available"],
			default: "In stock",
			required: true,
		},
		remainingIs: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

exports.Products = mongoose.model("products", Products);
