const mongoose = require("mongoose");

const essentialNumbers = mongoose.Schema(
	{
		name: { type: String, default: "" },
		phone: { type: String, default: "" },
		logo: { type: String, default: "" },
		userId: { type: String, default: "" },
		isPhoneActive: Boolean,
		addedBy: { type: String, default: "" },
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.essentialNumbers = mongoose.model("essentialNumbers", essentialNumbers);
