const mongoose = require("mongoose");

const livingRecentSearch = mongoose.Schema(
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

exports.livingRecentSearch = mongoose.model(
	"livingRecentSearch",
	livingRecentSearch
);
