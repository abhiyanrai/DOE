const admin = require("firebase-admin");
const firebaseConfig = require("../firebaseConfig/config.json");
const getVideoDuration = require("get-video-duration");
const axios = require("axios");

admin.initializeApp({
	credential: admin.credential.cert(firebaseConfig),
});

exports.OtpGenerator = () => {
	const chars = "0123456789";
	var otp = "";
	for (let index = 0; index < 6; index++) {
		otp += chars[Math.floor(Math.random() * chars.length)];
	}
	return otp;
};

exports.sendNotification = function (registrationToken, msg) {
	console.log(
		"🚀 ~ file: functions.js:13 ~ registrationToken:",
		registrationToken
	);
	try {
		if (registrationToken == null || registrationToken == "") {
			return;
		}

		const notification_options = {
			priority: "high",
			timeToLive: 60 * 60 * 24,
		};

		const message_notification = {
			notification: {
				title: msg,
				body: "DOE",
			},
		};

		// let message = {
		// 	android: {
		// 		notification: {
		// 			title: "Notification Title From DOE",
		// 			body: "Notification Body By DOE",
		// 		},
		// 	},
		// 	token: registrationToken,
		// };

		admin
			.messaging()
			.sendToDevice(
				registrationToken,
				message_notification,
				notification_options
			)
			.then((response) => {
				console.log(
					response.results,
					"Notification Sent To Device SuccessFully"
				);
				return;
			})
			.catch((error) => {
				console.log(error, "Something Went Wrong");
				return;
			});
	} catch (error) {
		console.log("🚀 ~ file: functions.js:51 ~ error:", error);
	}
};

exports.calculateTimeDifference = (uploadDate) => {
	var currentDate = new Date();
	var timeDifference = currentDate - uploadDate;

	var seconds = Math.floor(timeDifference / 1000);
	var minutes = Math.floor(seconds / 60);
	var hours = Math.floor(minutes / 60);
	var days = Math.floor(hours / 24);
	var months = Math.floor(days / 30);

	if (months > 0) {
		return `${months} months ago`;
	}

	if (days > 0) {
		return `${days} days ago`;
	}

	if (hours > 0) {
		return `${hours} hours ago`;
	}

	if (minutes > 0) {
		return `${minutes} minutes ago`;
	}

	if (seconds > 0) {
		return `${seconds} seconds ago`;
	}
};

exports.getVideoTimeDuration = (file) => {
	return new Promise((resolve, reject) => {
		getVideoDuration
			.getVideoDurationInSeconds(file.path)
			.then((durationInSeconds) => {
				let duration = durationInSeconds.toString().split(".")[0];
				let hours = Math.floor(duration / 3600);
				let minutes = Math.floor((duration % 3600) / 60);
				let remainingSeconds = duration % 60;

				if (hours > 0) {
					hours = hours === 1 ? "0" + hours + ":" : hours;
				} else {
					hours = "00";
				}

				if (minutes > 0) {
					minutes = minutes === 1 ? "0" + minutes + ":" : minutes;
				} else {
					minutes = "00";
				}

				if (remainingSeconds > 0) {
					remainingSeconds =
						remainingSeconds === 1 ? "0" + remainingSeconds : remainingSeconds;
				} else {
					remainingSeconds = "00";
				}

				resolve(`${hours}:${minutes}:${remainingSeconds}`);
			})
			.catch((err) => {
				console.error("Error:", err);
				reject(err);
			});
	});
};

exports.findPlacesByTextQuery = async (text) => {
	return new Promise(async (resolve, reject) => {
		const responseData = await axios.get(
			`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${text}&key=${process.env.GOOGLE_API_KEY}`
		);
		if (responseData?.data?.status == "OK") {
			return resolve(responseData.data?.results);
		} else {
			return resolve(responseData?.data);
		}
	});
};

exports.removeDuplicates = (arr, key) => {
	return arr.reduce((uniqueIds, item) => {
		if (!uniqueIds.includes(item[key])) {
			uniqueIds.push(item[key]);
		}
		return uniqueIds;
	}, []);
};

exports.findNavigateDataByLatLong = async (lat, long, lat2, long2) => {
	return new Promise(async (resolve, reject) => {
		const responseData = await axios.get(
			`https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${long}&destination=${lat2},${long2}&key=${process.env.GOOGLE_API_KEY}`
		);

		if (responseData?.data?.status == "OK") {
			return resolve(
				responseData?.data?.routes?.[0]?.overview_polyline?.points
			);
		} else {
			return reject(responseData?.data);
		}
	});
};

exports.formatBytes = (a, b = 2) => {
	if (!+a) return "0 Bytes";
	const c = 0 > b ? 0 : b,
		d = Math.floor(Math.log(a) / Math.log(1024));
	return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
		["Bytes", "KB", "MB"][d]
	}`;
};
