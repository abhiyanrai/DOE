const { AdminUser } = require("../modelsAdmin/users");
const { validationResult } = require("express-validator");
const { Messages } = require("../utils/constant");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/awsFunctions");
const { User } = require("../models/users");
const { OtpGenerator } = require("../utils/functions");
const { Shops } = require("../modelsAdmin/shop")
const { Products }= require("../modelsAdmin/products")

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

// Signup ********************************************************

exports.signUpAdmin = async (req, res, next) => {
	try {
		const { email, password, name, role, profileImage } = req.body;

		const { headers } = req;
		const token = headers?.authorization?.split(" ")[1];

		if (token) {
			let verifyToken;
			try {
				verifyToken = jwt.verify(token, process.env.secretToken);
			} catch (error) {
				return res.status(401).json({
					status: 0,
					message: "request not authorize.",
				});
			}
			if (verifyToken) {
				if (verifyToken.secretMessage == process.env.secretMessage) {
					const isUserExist = await AdminUser.findOne({
						email,
						isActive: true,
					});
					if (isUserExist) {
						return getResponse(res, 409, 0, Messages.ALREADY_EXIST, {});
					} else {
						const hashPass = await bcrypt.hash(password, 10);
						const addUser = new AdminUser({
							email,
							password: hashPass,
							name,
							role,
							profileImage,
						});
						await addUser.save();
						return getResponse(res, 200, 1, Messages.ADMIN_CREATED, "");
					}
				} else {
					return res.status(401).json({
						status: 0,
						message: "request not authorize.",
					});
				}
			} else {
				return res.status(401).json({
					status: 0,
					message: "request not authorize.",
				});
			}
		} else {
			return res.status(401).json({
				status: 0,
				message: "request not authorize.",
			});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// Admin Sign In ***************************************************

exports.signInAdmin = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const isUserExist = await AdminUser.findOne({ email, isActive: true });
		if (isUserExist) {
			const hashPass = await bcrypt.compare(password, isUserExist.password);
			if (hashPass) {
				const convertJson = JSON.parse(JSON.stringify(isUserExist));

				const createToken = jwt.sign(
					{ adminId: convertJson._id },
					process.env.JWT_SECRET_ADMIN
				);

				convertJson.token = createToken;
				delete convertJson.password;
				return getResponse(res, 200, 1, Messages.ADMIN_LOGIN, convertJson);
			} else {
				return getResponse(res, 400, 0, Messages.INCORRECT_PASSWORD, {});
			}
		} else {
			return getResponse(res, 400, 0, Messages.INVALID_EMAIL, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// Admin Details *******************************************************

exports.getAdminDetails = async (req, res, next) => {
	try {
		const isUserExist = await AdminUser.findOne({ _id: req.adminId });
		if (isUserExist) {
			const convertJson = JSON.parse(JSON.stringify(isUserExist));
			delete convertJson.password;
			return getResponse(res, 200, 1, Messages.ADMIN_DETAILS, convertJson);
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// update Profile ************************************************

exports.updateProfile = async (req, res, next) => {
	try {
		const { name, phoneNumber, profileImage } = req.body;
		const isUserExist = await AdminUser.findOne({ _id: req.adminId });
		if (isUserExist) {
			let params = {};

			if (profileImage) {
				params.profileImage = profileImage;
			}

			if (name) {
				params.name = name;
			}

			if (phoneNumber) {
				params.phoneNumber = phoneNumber;
			}

			const updateAdmin = await AdminUser.updateMany(
				{ _id: req.adminId },
				params
			);

			if (updateAdmin) {
				return getResponse(res, 200, 1, Messages.ADMIN_UPDATE, {});
			} else {
				return res
					.status(500)
					.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
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

// forget password ************************************************

exports.forgetPassword = async (req, res, next) => {
	try {
		const { email } = req.body;
		const isUserExist = await AdminUser.findOne({
			email: email,
			isActive: true,
		});
		if (isUserExist) {
			let otp = OtpGenerator();
			isUserExist.Otp = await bcrypt.hash(otp, 10);
			isUserExist.save();
			sendEmail(email, otp);
			return getResponse(res, 200, 1, Messages.FORGET_PASSWORD, "");
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

// reset password ************************************************

exports.resetPassword = async (req, res, next) => {
	try {
		const { password } = req.body;
		const { adminId } = req;

		if (!adminId) {
			return res.status(401).json({
				status: 0,
				message: "request not authorize",
			});
		}

		const isUserExist = await AdminUser.findOne({
			_id: adminId,
			isActive: true,
		});

		if (isUserExist) {
			const hashPass = await bcrypt.hash(password, 10);
			isUserExist.password = hashPass;
			isUserExist.save();
			return getResponse(res, 200, 1, Messages.RESET_PASSWORD, "");
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllUser = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;

		const skip = limit * page - limit;

		const getAllData = await User.find({
			isActive: true,
		});

		const getAllDataBySeach = await User.find({
			email: { $regex: search, $options: "i" },
			isActive: true,
		})
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		if (getAllDataBySeach.length > 0) {
			const mapArray = getAllDataBySeach.map(async (item) => {
				let data1 = JSON.parse(JSON.stringify(item));
				delete data1?.password;
				return data1;
			});

			Promise.all(mapArray)
				.then((data) => {
					return res.status(200).json({
						status: 1,
						message: Messages.USER_DETAILS,
						totalData: getAllData.length,
						currentPage: page ? page : 1,
						data: data,
					});
				})
				.catch((err) => {
					return res.status(500).json({ status: 0, message: err.message });
				});
		} else {
			return res.status(200).json({
				status: 0,
				message: Messages.DATA_NOT_FOUND,
				totalData: 0,
				currentPage: 1,
				data: [],
			});
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

		const isUserExist = await AdminUser.findOne({
			email: email,
			isActive: true,
		});

		if (isUserExist) {
			const checkOtp = await bcrypt.compare(otp, isUserExist.Otp);
			if (checkOtp) {
				const createToken = jwt.sign(
					{ adminId: isUserExist._id, type: "admin" },
					process.env.JWT_SECRET_OTP
				);
				return getResponse(res, 200, 1, Messages.OTP_VERIFIED, createToken);
			} else {
				return getResponse(res, 400, 0, Messages.INCORRECT_OTP, "");
			}
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllAdminDetails = async (req, res, next) => {
	try {
		const isUserExist = await AdminUser.find({ isActive: true });
		if (isUserExist) {
			const mapData = isUserExist.map((e) => {
				const convertJson = JSON.parse(JSON.stringify(e));
				delete convertJson.password;
				return convertJson;
			});
			return getResponse(res, 200, 1, Messages.ADMIN_DETAILS, mapData);
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteAdminById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const isUserExist = await AdminUser.findOne({ _id: id, isActive: true });
		if (isUserExist) {
			isUserExist.isActive = false;
			isUserExist.save();

			return getResponse(res, 200, 1, Messages.ADMIN_DELETED, {});
		} else {
			return getResponse(res, 400, 0, Messages.USER_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};



exports.getAllVendorDetails = async (req, res, next) => {
	try {
        const allVendors = await AdminUser.find({ isActive: true, role: "vendor" });
        const allShops = await Shops.find({ isActive: true });
        const allProducts = await Products.find({ isActive: true});

        const vendorsWithDetails = allVendors.map(vendor => {

            const vendorObj = vendor.toObject();
			
            vendorObj.shops = [];

            const shopsForVendor = allShops.filter(shop => shop.createdBy.equals(vendor._id));
            
            for (const shop of shopsForVendor) {
                const shopObj = shop.toObject();
                shopObj.products = allProducts.filter(product => product.shopId.equals(shop._id));
                vendorObj.shops.push(shopObj);
            }

            return vendorObj;
        });

		return getResponse(
			res,
			200,
			1,
            Messages.VENDOR_DATA_FETCHED,
			vendorsWithDetails
		);
    } catch (error) {
        return res
            .status(500)
            .json({ status: 0, message: "Something went wrong" });
    }
}