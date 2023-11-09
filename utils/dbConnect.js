const mongoose = require("mongoose");

try {
	mongoose
		.connect(process.env.URI)
		.then((connect) => {
			console.log("Database connected");
		})
		.catch((err) => {
			console.log(err, "Database connection error");
		});
} catch (error) {
	console.log(error, "Db err");
}
