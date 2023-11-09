const mongoose = require("mongoose");

const limitation = mongoose.Schema(
	{
		module: {
			type: String,
			require: true,
		},
		limit: {
			type: Number,
			require: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		//	createdAt: {
		//	type: Date,
		//		default: new Date(),
		//},
	},
	{ timestamps: true }
);

exports.limitation = mongoose.model("limitation", limitation);
