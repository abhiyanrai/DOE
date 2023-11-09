const mongoose = require("mongoose");
const moment = require("moment");

const candidates = mongoose.Schema(
	{
		candidateStatus: {
			type: Array,
			default: [
				{ name: "Applied", status: 1, time: moment().format("LL") },
				{ name: "Shortlisted", status: 0, time: "" },
				{ name: "Resume Viewed", status: 0, time: "" },
				{ name: "Awaiting recruiter action", status: 0, time: "" },
			],
		},
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
		city: { type: String, require: true },
		resume: { type: String, require: true },
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.candidates = mongoose.model("candidates", candidates);
