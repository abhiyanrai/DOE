const mongoose = require("mongoose");
const moment = require("moment");

const officesAndEmbassies = mongoose.Schema(
	{
		name: { type: String, require: true },
		address: { type: String, require: true },
		imageLogo: { type: String, require: true },
		isActive: { type: Boolean, default: true },
		myDocumentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "myDocuments",
			require: true,
		},
		//createdAt: { type: Date, default: new Date() },, default: moment().format() },
	},
	{ timestamps: true }
);

exports.officesAndEmbassies = mongoose.model(
	"officesAndEmbassies",
	officesAndEmbassies
);
