const mongoose = require("mongoose");

const customListOfDocuments = mongoose.Schema(
	{
		docUrl: { type: String, require: true },
		isActive: { type: Boolean, default: true },
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

exports.customListOfDocuments = mongoose.model(
	"customListOfDocuments",
	customListOfDocuments
);
