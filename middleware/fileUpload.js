const multer = require("multer");

var storage = multer.diskStorage({
	filename: function (req, file, callback) {
		callback(null, file.originalname);
	},
});
var upload = multer({ storage: storage }).any();

module.exports = (req, res, next) => {
	upload(req, res, function (err) {
		req.uploadError = false;

		if (err) {
			console.log(err, "asjdlkasj");
			req.uploadError = true;
			return res
				.status(500)
				.json({ status: 0, message: "Error uploading file." });
		}
		next();
	});
};
