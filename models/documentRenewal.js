const mongoose = require("mongoose");

const documentRenewal = mongoose.Schema(
	{
		notificationText: { type: String, default: "" },
		issueDate: { type: String, require: true },
		expiryDate: { type: String, require: true },
		otherDescription: { type: String, default: "" },
		reminder: { type: Array, require: true },
		isActive: { type: Boolean, default: true },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		myDocumentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "myDocuments",
			require: true,
		},
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.documentRenewal = mongoose.model("documentRenewal", documentRenewal);
