const mongoose = require("mongoose");

const savedVideosAndInshorts = mongoose.Schema(
	{
		isActive: { type: Boolean, default: true },
		entertainmentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "entertainment",
			require: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			require: true,
		},
		isSaved: { type: Boolean, default: true },
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.savedVideosAndInshorts = mongoose.model(
	"savedVideosAndInshorts",
	savedVideosAndInshorts
);
