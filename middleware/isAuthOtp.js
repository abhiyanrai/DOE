const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
	const authHeader = req.get("Authorization");
	req.forbidden = true;
	let decodeToken;

	if (!authHeader) {
		req.isAuth = false;
		return res.status(401).json({
			status: 0,
			message: "request not authorize",
		});
	}

	const token = authHeader.split(" ")[1];
	if (!token || token == "") {
		req.isAuth = false;
		return res.status(401).json({
			status: 0,
			message: "request not authorize",
		});
	}

	try {
		decodeToken = jwt.verify(token, process.env.JWT_SECRET_OTP);
	} catch (error) {
		console.log(error);
		req.isAuth = false;
		return res.status(401).json({
			status: 0,
			message: "request not authorize",
		});
	}

	if (!decodeToken) {
		req.isAuth = false;
		return res.status(401).json({
			status: 0,
			message: "request not authorize",
		});
	}

	console.log("🚀 ~ file: isAuthOtp.js:44 ~ decodeToken:", decodeToken);
	if (decodeToken && decodeToken.type == "user") {
		req.userId = decodeToken.userId;
	} else {
		req.adminId = decodeToken.adminId;
	}

	req.isAuth = true;
	next();
};
