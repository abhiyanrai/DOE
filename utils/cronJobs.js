var cron = require("node-cron");
const { documentRenewal } = require("../models/documentRenewal");
const { User } = require("../models/users");
const { sendNotification } = require("./functions");

cron.schedule("0 0 * * *", async () => {
	try {
		console.log("cron run");
		const findData = await documentRenewal.find({ isActive: true });
		for (let index = 0; index < findData.length; index++) {
			const element = findData[index];

			const date1 = new Date();
			const date2 = new Date(element.expiryDate);

			const d1 = new Date(date1.toJSON().split("T")[0]);
			const d2 = new Date(date2.toJSON().split("T")[0]);

			var year1 = d1.getFullYear();
			var month1 = d1.getMonth();

			var year2 = d2.getFullYear();
			var month2 = d2.getMonth();

			var diffMonths = (year2 - year1) * 12 + (month2 - month1);

			const findUser = await User.findOne({
				_id: element.userId,
				isActive: true,
			});

			if (diffMonths == 1) {
				const result = element.reminder.includes(1);
				if (findUser && result) {
					sendNotification(findUser.deviceToken, "Document Renewal Reminder");
					console.log(
						"🚀 ~ file: app.js:74 ~ cron.schedule ~ diffMonths:",
						diffMonths
					);
				}
			}

			if (diffMonths == 2) {
				const result = element.reminder.includes(2);
				if (findUser && result) {
					sendNotification(findUser.deviceToken, "Document Renewal Reminder");
					console.log(
						"🚀 ~ file: app.js:74 ~ cron.schedule ~ diffMonths:",
						diffMonths
					);
				}
			}

			if (diffMonths == 3) {
				const result = element.reminder.includes(3);
				if (findUser && result) {
					sendNotification(findUser.deviceToken, "Document Renewal Reminder");
					console.log(
						"🚀 ~ file: app.js:74 ~ cron.schedule ~ diffMonths:",
						diffMonths
					);
				}
			}
		}
	} catch (error) {
		console.log("🚀 ~ file: app.js:60 ~ cron.schedule ~ error:", error);
	}
});
