const mongoose = require("mongoose");

const industryAndSkills = mongoose.Schema(
	{
		name: { type: String, require: true },
		type: { type: String, require: true },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

exports.industryAndSkills = mongoose.model(
	"industryAndSkills",
	industryAndSkills
);

// type  == industry
// type  == skill
