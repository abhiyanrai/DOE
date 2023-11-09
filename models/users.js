const mongoose = require("mongoose");

const User = mongoose.Schema(
	{
		email: { type: String, default: "" },
		name: { type: String, default: "" },
		// lastname: { type: String, default: "" },
		dob: { type: String, default: "" },
		gender: { type: String, default: "" },
		birthPlace: { type: String, default: "" },
		phoneNumber: { type: String, default: "" },
		Otp: { type: String, default: "" },
		password: { type: String, require: true },
		isActive: Boolean,
		role: { type: String, default: "" },
		deviceToken: { type: String, default: "" },
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.User = mongoose.model("users", User);
