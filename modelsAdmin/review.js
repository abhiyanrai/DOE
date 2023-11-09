const mongoose = require("mongoose");

const reviews = mongoose.Schema(
	{
		name: { type: String, require: true },
		rating: { type: String, require: true },
		isActive: { type: Boolean, default: true },
		review: { type: String, default: "" },
		jobId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "companies",
			require: true,
		},
		companyId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "companies",
			require: true,
		},
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.reviews = mongoose.model("reviews", reviews);
