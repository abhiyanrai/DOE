const mongoose = require("mongoose");

const savedJobs = mongoose.Schema(
	{
		candidateStatus: { type: String, default: "Apply" },
		isActive: { type: Boolean, default: true },
		jobId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "jobs",
			require: true,
		},
		companyId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "companies",
			require: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			require: true,
		},
		isSaved: { type: Boolean, default: true },
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.savedJobs = mongoose.model("savedJobs", savedJobs);
