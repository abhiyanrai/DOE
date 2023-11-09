const mongoose = require("mongoose");

const company = mongoose.Schema(
	{
		name: { type: String, require: true },
		logo: { type: String, default: "" },
		url: { type: String, default: "" },
		phoneNumber: { type: String, default: "" },
		isActive: { type: Boolean, default: true },
		emailAddress: { type: String, default: "" },
		description: { type: String, default: "" },
		salaryRange: { type: String, require: true },
		locality: { type: String, default: "" },
		rangeSelector: { type: Boolean, default: false },
		industry: { type: String, default: "" },
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.company = mongoose.model("companies", company);
