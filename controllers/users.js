const { User } = require("../models/users");
const { Messages } = require("../utils/constant");
const brcypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserDetails } = require("../models/userDetails");
const formidable = require("formidable");
const { sendEmail, uploadImageToS3 } = require("../utils/awsFunctions");
const {
	OtpGenerator,
	getVideoTimeDuration,
	sendNotification,
	formatBytes,
} = require("../utils/functions");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

// Signup ********************************************************

exports.signUp = async (req, res, next) => {
	try {
		const { username, password } = req.body;

		console.log("???????????", username);

		let serchData = {};

		if (
			/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(username.trim())
		) {
			serchData.email = username.trim();
		} else {
			if (/^[0-9]{10}$/.test(username.trim())) {
				serchData.phoneNumber = username.trim();
			} else {
				return getResponse(res, 200, 0, Messages.INVALID_EMAIL_OR_PHONE, {});
			}
		}
		console.log(serchData, "serchData");
		if (!serchData || !password) {
			return getResponse(res, 200, 0, Messages.INVALID_EMAIL_OR_PHONE, {});
		} else {
			const findUser = await User.findOne({ ...serchData });
			console.log(findUser, "findUser");
			if (findUser) {
				return getResponse(
					res,
					200,
					0,
					serchData.email
						? Messages.EMAIL_ALREADY_EXIST
						: Messages.PHONE_ALREADY_EXIST,
					{}
				);
			} else {
				const hashPass = await brcypt.hash(password, 10);
				const addUser = new User({
					...serchData,
					password: hashPass,
					isActive: true,
				});
				if (addUser) {
					addUser.save();
					const convertJson = JSON.parse(JSON.stringify(addUser));
					const createToken = jwt.sign(
						{ userId: convertJson._id },
						process.env.JWT_SECRET_USER
					);
					convertJson.token = createToken;
					delete convertJson.password;
					return getResponse(res, 200, 1, Messages.USER_SIGNUP, convertJson);
				} else {
					return getResponse(res, 500, 0, Messages.SOMETHING_WENT_WRONG, "");
				}
			}
		}
	} catch (error) {
		console.log("🚀 ~ file: users.js:44 ~ exports.signUp= ~ error:", error);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// Signin ********************************************************

exports.signIn = async (req, res, next) => {
	try {
		const { username, password } = req.body;

		let serchData = {};

		if (
			/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(username.trim())
		) {
			serchData.email = username.trim();
		} else {
			if (/^[0-9]{10}$/.test(username.trim())) {
				serchData.phoneNumber = username.trim();
			} else {
				return getResponse(res, 200, 0, Messages.INVALID_EMAIL_OR_PHONE, {});
			}
		}

		if (!serchData || !password) {
			return getResponse(res, 200, 0, Messages.INVALID_EMAIL_OR_PHONE, {});
		} else {
			const findUser = await User.findOne({ ...serchData, isActive: true });

			if (findUser) {
				const checkPass = await brcypt.compare(password, findUser.password);
				if (checkPass) {
					const convertJson = JSON.parse(JSON.stringify(findUser));

					const createToken = jwt.sign(
						{ userId: convertJson._id },
						process.env.JWT_SECRET_USER
					);

					convertJson.token = createToken;
					delete convertJson.password;
					return getResponse(res, 200, 1, Messages.USER_SIGNIN, convertJson);
				} else {
					return getResponse(res, 200, 0, Messages.INCORRECT_PASSWORD, {});
				}
			} else {
				return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, {});
			}
		}
	} catch (error) {
		console.log("🚀 ~ file: users.js:80 ~ exports.logIn= ~ error:", error);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// user Details *******************************************************

exports.getUserDetails = async (req, res, next) => {
	try {
		const isUserExist = await User.findOne({ _id: req.userId, isActive: true });
		if (isUserExist) {
			const convertJson = JSON.parse(JSON.stringify(isUserExist));
			const findUserDetails = await UserDetails.findOne({
				userId: req.userId,
			});
			delete convertJson.password;
			convertJson.moreDetails = findUserDetails ? findUserDetails : {};
			return getResponse(res, 200, 1, Messages.USER_DETAILS, convertJson);
		} else {
			return getResponse(res, 200, 0, Messages.USER_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// update user Profile ************************************************

exports.updateUserProfile = async (req, res, next) => {
	try {
		const {
			name,
			dob,
			gender,
			birthPlace,
			country,
			zipCode,
			profile,
			qualification,
			jobTitle,
			experience,
			organization,
			compensation,
			correspondence_Address,
			correspondence_country,
			correspondence_zipcode,
		} = req.body;
		const isUserExist = await User.findOne({ _id: req.userId, isActive: true });
		if (isUserExist) {
			let params = {};
			let moreParams = {};

			if (name) {
				params.name = name;
			}
			if (dob) {
				params.dob = dob;
			}
			if (gender) {
				params.gender = gender;
			}
			if (birthPlace) {
				params.birthPlace = birthPlace;
			}

			if (country) {
				moreParams.country = country;
			}
			if (zipCode) {
				moreParams.zipCode = zipCode;
			}
			if (profile) {
				moreParams.profile = profile;
			}
			if (qualification) {
				moreParams.qualification = qualification;
			}
			if (jobTitle) {
				moreParams.jobTitle = jobTitle;
			}
			if (experience) {
				moreParams.experience = experience;
			}
			if (organization) {
				moreParams.organization = organization;
			}
			if (correspondence_Address) {
				moreParams.correspondence_Address = correspondence_Address;
			}
			if (correspondence_country) {
				moreParams.correspondence_country = correspondence_country;
			}
			if (correspondence_zipcode) {
				moreParams.correspondence_zipcode = correspondence_zipcode;
			}
			if (compensation) {
				moreParams.compensation = compensation;
			}
			const updateProfile = await User.updateMany(
				{ _id: req.userId, isActive: true },
				params
			);

			if (updateProfile) {
				const findUserDetails = await UserDetails.findOne({
					userId: req.userId,
				});

				if (!findUserDetails) {
					const addMoreDetails = await UserDetails.create({
						...moreParams,
						userId: req.userId,
					});
				} else {
					const updateMoreDetails = await UserDetails.updateOne(
						{
							_id: findUserDetails._id,
						},
						{
							...moreParams,
						}
					);
				}
				return getResponse(res, 200, 1, Messages.USER_UPDATE, "");
			} else {
				return getResponse(res, 500, 0, Messages.SOMETHING_WENT_WRONG, "");
			}
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.forgetPassword = async (req, res, next) => {
	try {
		const { email } = req.body;

		let searchData = {};

		if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
			searchData.email = email.trim();
		} else {
			if (/^[0-9]{10}$/.test(email.trim())) {
				searchData.phoneNumber = email.trim();
			} else {
				return getResponse(res, 200, 0, Messages.INVALID_EMAIL_OR_PHONE, {});
			}
		}

		const isUserExist = await User.findOne({
			...searchData,
			isActive: true,
		});

		if (isUserExist) {
			let otp = OtpGenerator();
			isUserExist.Otp = await brcypt.hash(otp, 10);
			isUserExist.save();

			if (searchData.phoneNumber != undefined) {
				sendNotification(
					isUserExist.deviceToken,
					"OTP for forget password " + otp
				);
			} else {
				sendEmail(email, otp);
			}

			return getResponse(res, 200, 1, Messages.FORGET_PASSWORD, "");
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.fileUpload = async (req, res, next) => {
	try {
		// const form = new formidable.IncomingForm();
		// form.parse(req, async (err, fields, files) => {
		// 	console.log("🚀 ~ file: users.js:303 ~ form.parse ~ files:", files);
		// 	try {
		// 		if (err) {
		// 			console.error(err);
		// 			return res.status(500).json({ status: 0, message: err.message });
		// 		}
		// 		const file = files["file"];
		// 		console.log("🚀 ~ file: users.js:311 ~ form.parse ~ file:", file);

		// 1 -> profile pic
		// 2 -> document
		// 3 -> thubnail
		// 4 -> video

		let file = req.files;

		let { folder, type } = req.body;

		let errMsg =
			type == 1
				? Messages.PROFILE_PIC_PROVIDE
				: type == 2
				? Messages.DOCUMENT_PROVIDE
				: type == 3
				? Messages.THUMBNAIL_PROVIDE
				: type == 4
				? Messages.VIDEO_PROVIDE
				: type == 5
				? Messages.IMAGE_PROVIDE
				: Messages.FILE_PROVIDE;

		if (!file || file.length == 0) {
			return res.status(500).json({ status: 0, message: errMsg });
		}

		if (folder == "resume") {
			const bytes = formatBytes(file[0].size);
			if (bytes.includes("MB")) {
				const findNumber = bytes.split(" ")[0];
				if (findNumber > 5) {
					return res
						.status(400)
						.json({
							status: 0,
							message: "Resume file size shouldn't be more than 5 MB",
						});
				}
			}
		}

		let msg =
			type == 1
				? Messages.UPLOAD_PROFILE_PIC
				: type == 2
				? Messages.UPLOAD_DOCUMENT
				: type == 3
				? Messages.UPLOAD_THUMBNAIL
				: type == 4
				? Messages.UPLOAD_VIDEO
				: type == 5
				? Messages.UPLOAD_IMAGE
				: Messages.UPLOAD_FILE;

		let uploadImage = await uploadImageToS3(file[0], folder);
		if (uploadImage) {
			let data = {
				fileName: uploadImage,
				videoTimeDuration: "00:00:00",
			};
			if (type == 4) {
				let videoTimeDuration = await getVideoTimeDuration(file[0]);
				if (videoTimeDuration) {
					data.videoTimeDuration = videoTimeDuration;
				} else {
					return getResponse(res, 500, 0, errMsg, videoTimeDuration);
				}
			}
			return getResponse(res, 200, 1, msg, data);
		} else {
			return getResponse(res, 500, 0, errMsg, uploadImage);
		}

		// 	} catch (error) {
		// 		return res
		// 			.status(500)
		// 			.json({ status: 0, message: Messages.FILE_PROVIDE });
		// 	}
		// });
	} catch (error) {
		console.log(
			"🚀 ~ file: users.js:333 ~ exports.fileUpload= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.multipleFileUpload = async (req, res, next) => {
	try {
		const files = req.files || [req.file];

		const { folder, type } = req.body;

		let errMsg =
			type == 1
				? Messages.PROFILE_PIC_PROVIDE
				: type == 2
				? Messages.DOCUMENT_PROVIDE
				: type == 3
				? Messages.THUMBNAIL_PROVIDE
				: type == 4
				? Messages.VIDEO_PROVIDE
				: type == 5
				? Messages.IMAGE_PROVIDE
				: Messages.FILE_PROVIDE;

		if (!files || files.length === 0 || files[0] == undefined) {
			return res.status(500).json({ status: 0, message: errMsg });
		}

		let msg =
			type == 1
				? Messages.UPLOAD_PROFILE_PIC
				: type == 2
				? Messages.UPLOAD_DOCUMENT
				: type == 3
				? Messages.UPLOAD_THUMBNAIL
				: type == 4
				? Messages.UPLOAD_VIDEO
				: type == 5
				? Messages.UPLOAD_IMAGE
				: Messages.UPLOAD_FILE;

		const uploadPromises = files.map(async (file) => {
			const uploadImage = await uploadImageToS3(file, folder);
			if (!uploadImage) {
				return null;
			}

			const data = {
				fileName: uploadImage,
				videoTimeDuration: "00:00:00",
			};

			if (type == 4) {
				const videoTimeDuration = await getVideoTimeDuration(file);
				if (videoTimeDuration) {
					data.videoTimeDuration = videoTimeDuration;
				} else {
					return null;
				}
			}

			return data;
		});

		const uploadResults = await Promise.all(uploadPromises);

		const successfulUploads = uploadResults.filter((result) => result !== null);

		if (successfulUploads.length === 0) {
			return res.status(500).json({ status: 0, message: errMsg });
		}

		return res
			.status(200)
			.json({ status: 1, message: msg, data: successfulUploads });
	} catch (error) {
		console.log("🚀 ~ error:", error);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// reset password ************************************************

exports.resetPassword = async (req, res, next) => {
	try {
		const { password } = req.body;
		const { userId } = req;

		if (!userId) {
			return res.status(401).json({
				status: 0,
				message: "request not authorize",
			});
		}

		const isUserExist = await User.findOne({
			_id: userId,
			isActive: true,
		});

		if (isUserExist) {
			const hashPass = await brcypt.hash(password, 10);
			isUserExist.password = hashPass;
			isUserExist.save();
			return getResponse(res, 200, 1, Messages.RESET_PASSWORD, "");
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// otp verification ************************************************

exports.otpVerification = async (req, res, next) => {
	try {
		const { email, otp } = req.body;

		const isUserExist = await User.findOne({
			email: email,
			isActive: true,
		});

		if (isUserExist) {
			const checkOtp = await brcypt.compare(otp, isUserExist.Otp);
			if (checkOtp) {
				const createToken = jwt.sign(
					{ userId: isUserExist._id, type: "user" },
					process.env.JWT_SECRET_OTP
				);
				return getResponse(res, 200, 1, Messages.OTP_VERIFIED, createToken);
			} else {
				return getResponse(res, 400, 0, Messages.INCORRECT_OTP, "");
			}
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// update device token **********************************************

exports.updateDeviceToken = async (req, res, next) => {
	try {
		const { token } = req.body;
		const { userId } = req;

		const isUserExist = await User.findOne({
			_id: userId,
			isActive: true,
		});

		if (isUserExist) {
			isUserExist.deviceToken = token;
			isUserExist.save();
			return getResponse(res, 200, 1, Messages.DEVICE_TOKEN_UPDATE, "");
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
