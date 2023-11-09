const mongoose = require("mongoose");

const applicationForm = mongoose.Schema(
	{
		name: { type: String, default: "" },
		formLink: { type: String, require: true },
		isActive: { type: Boolean, default: true },
		myDocumentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "myDocuments",
			require: true,
		},
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.applicationForm = mongoose.model("applicationForm", applicationForm);
