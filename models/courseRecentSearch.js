const mongoose = require("mongoose");

const courseRecentSearch = mongoose.Schema(
	{
		title: { type: String, require: true },
		isActive: { type: Boolean, default: true },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			require: true,
		},
	},
	{ timestamps: true }
);

exports.courseRecentSearch = mongoose.model(
	"courseRecentSearch",
	courseRecentSearch
);
