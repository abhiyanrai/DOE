const moment = require("moment");
const mongoose = require("mongoose");

const AdminUser = mongoose.Schema(
	{
		email: { type: String, require: true, unique: true },
		password: { type: String, require: true },
		name: { type: String, require: true },
		// lastName: { type: String, default: "" },
		phoneNumber: { type: String, default: "" },
		profileImage: { type: String, default: "" },
		isActive: { type: Boolean, default: true },
		Otp: { type: String, default: "" },
		role: { type: String, default: "admin" },
		//createdAt: { type: Date, default: new Date() },, default: moment().format() },
	},
	{ timestamps: true }
);

exports.AdminUser = mongoose.model("usersAdmin", AdminUser);
