const mongoose = require("mongoose");

const Shops = new mongoose.Schema(
	{
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "usersAdmin",
		},
		name: {
			type: String,
			required: true,
		},
		emailId: {
			type: String,
			required: true,
		},
		location: {
			type: String,
			required: true,
		},
		numberOfProducts: {
			type: Number,
			default: 0,
		},
		totalSell: {
			type: Number,
			default: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

exports.Shops = mongoose.model("shops", Shops);
