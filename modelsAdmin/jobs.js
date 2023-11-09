const mongoose = require("mongoose");

const jobs = mongoose.Schema(
	{
		title: { type: String, require: true },
		jobStatus: { type: String, default: "Open" },
		isActive: { type: Boolean, default: true },
		description: { type: String, default: "" },
		workExp: { type: String, require: true },
		employmentType: { type: String, require: true },
		skillsRequired: { type: Array, require: true },
		noOfPosition: { type: Number, require: true },
		companyId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "companies",
			require: true,
		},
		salaryType: {
			type: String,
			default: "annum",
		},
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.jobs = mongoose.model("jobs", jobs);
