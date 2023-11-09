const mongoose = require("mongoose");

const myDocuments = mongoose.Schema(
	{
		docName: { type: String, default: "" },
		imageLogo: { type: String, default: "" },
		isActive: { type: Boolean, default: true },
		userId: {
			type: String,
			default: "",
		},
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.myDocuments = mongoose.model("myDocuments", myDocuments);
