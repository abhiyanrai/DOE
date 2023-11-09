const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
AWS.config.update({
	accessKeyId: process.env.AccessKeyID,
	secretAccessKey: process.env.SecretAccessKey,
	region: process.env.region,
});

const s3 = new AWS.S3();

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

exports.sendEmail = (email, otp) => {
	const params = {
		Destination: {
			ToAddresses: [
				"gaurav.sachdeva1@team.cliffex.com",
				"muhhammad.siddik@team.cliffex.com",
				"rajeev.kumar1@team.cliffex.com",
				"vinney.chauhan@team.cliffex.com",
				"shilpi.tyagi@team.cliffex.com"	
			],
		},
		Message: {
			Body: {
				Text: {
					Data: `
	Dear User, 
	
	We have received a request to reset your password for your account with us. here is a OTP for reset password -> ${otp} If you did not initiate this password reset request, please ignore this message. If you have any questions or concerns, please contact our customer support team. Thank you for using our service.
	Best regards,
	DOE`,
				},
			},
			Subject: {
				Data: "OTP for Reset Your Password",
			},
		},
		Source: "muhhammad.siddik@team.cliffex.com",
	};

	ses.sendEmail(params, function (err, data) {
		if (err) {
			console.log("Error sending email:", err);
		} else {
			console.log("Email sent:", data);
		}
	});
};

exports.uploadImageToS3 = (file, folder) => {
	console.log("🚀 ~ file: awsFunctions.js:52 ~ file, folder:", file, folder);
	// let fileDirectory = path.join(__dirname, "../", file.path);
	return new Promise((resolve, rejects) => {
		// const fileContentArrayBuffer = fs.readFileSync(fileDirectory);
		const stream = fs.createReadStream(file.path);
		console.log(file.originalname);
		let pathFolder = folder + "/" + file.originalname;
		// ? "profile/" + file.originalFilename
		// : type == 2
		// ? "essentialNumbersLogo/" + file.originalFilename
		// : type == 3
		// ? "listOfDocuments/" + file.originalFilename
		// : type == 4
		// ? "officesAndEmbassies/" + file.originalFilename
		// : type == 5
		// ? "applicationForm/" + file.originalFilename
		// : "others/" + file.originalFilename;
		let params = {
			Bucket: process.env.Bucket,
			Key: pathFolder,
			Body: stream,
			ContentType: file.mimetype,
		};
		return s3.upload(params, function (err, data) {
			console.log("🚀 ~ file: awsFunctions.js:77 ~ data:", data);
			if (err) {
				rejects(err);
			}

			// fs.unlinkSync(fileDirectory);
			resolve(pathFolder);
		});
	});
};
