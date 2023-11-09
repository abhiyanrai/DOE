const mongoose = require("mongoose");

const UserDetails = mongoose.Schema(
	{
		country: { type: String, default: "" },
		zipCode: { type: String, default: "" },
		profile: { type: String, default: "" },
		qualification: { type: String, default: "" },
		jobTitle: { type: String, default: "" },
		experience: { type: Number, default: 0 },
		organization: { type: String, default: "" },
		compensation: { type: String, default: "" },
		correspondence_Address: { type: String, default: "" },
		correspondence_country: { type: String, default: "" },
		correspondence_zipcode: { type: String, default: "" },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		//createdAt: { type: Date, default: new Date() },, default: new Date() },
	},
	{ timestamps: true }
);

exports.UserDetails = mongoose.model("userDetails", UserDetails);
