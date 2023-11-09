const mongoose = require("mongoose");

const listOfDocuments = mongoose.Schema(
	{
		passportImage: { type: String, default: "" },
		workPermitImage: { type: String, default: "" },
		registrationBookImage: { type: String, default: "" },
		marriageCertificationImage: { type: String, default: "" },
		residencyBookImage: { type: String, default: "" },
		birthCertificatonImage: { type: String, default: "" },
		isActive: { type: Boolean, default: true },
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
		myDocumentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "myDocuments",
			require: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
	},
	{ timestamps: true }
);

exports.listOfDocuments = mongoose.model("listOfDocuments", listOfDocuments);
