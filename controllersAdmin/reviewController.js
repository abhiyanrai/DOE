const { company } = require("../modelsAdmin/company");
const { Messages } = require("../utils/constant");
const { reviews } = require("../modelsAdmin/review");
const { jobs } = require("../modelsAdmin/jobs");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.addReviewAndRating = async (req, res, next) => {
	try {
		const { name, companyId, rating, jobId, review } = req.body;

		const findCompany = await company.find({ _id: companyId, isActive: true });
		if (findCompany.length == 0) {
			return getResponse(res, 400, 0, Messages.COMPANY_NOT_FOUND, {});
		} else {
			const findReview = await reviews.findOne({
				companyId: companyId,
				jobId: jobId,
				name: name,
				isActive: true,
			});

			if (!findReview) {
				const addReview = await reviews.create({
					companyId: companyId,
					jobId: jobId,
					review: review,
					rating: rating,
					name: name,
				});

				if (addReview) {
					return getResponse(res, 200, 1, Messages.REVIEW_ADDED, addReview);
				} else {
					return getError(res, 500, {
						status: 0,
						message: Messages.SOMETHING_WENT_WRONG,
					});
				}
			} else {
				return getResponse(res, 409, 0, Messages.ALREADY_EXIST, {});
			}
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllReviewsByJobId = async (req, res, next) => {
	try {
		const { id } = req.query;
		const findJobs = await jobs.find({ _id: id, isActive: true });

		if (findJobs.length > 0) {
			let arr = [];
			const findReview = await reviews
				.find({
					jobId: id,
					isActive: true,
				})
				.sort({ createdAt: -1 });

			for (let index = 0; index < findReview.length; index++) {
				let obj = JSON.parse(JSON.stringify(findReview[index]));
				const findCompany = await company.findOne({
					_id: obj.companyId,
					isActive: true,
				});
				obj.companyDetails = findCompany;
				arr.push(obj);
			}

			return getResponse(res, 200, 1, Messages.GET_REVIEW_LIST, arr);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getReviewsDetailsById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const findReview = await reviews.find({
			_id: id,
			isActive: true,
		});

		if (findReview.length > 0) {
			let obj = JSON.parse(JSON.stringify(findReview[0]));

			const findJobs = await jobs.findOne({ _id: obj.jobId, isActive: true });
			const findCompany = await company.findOne({
				_id: obj.companyId,
				isActive: true,
			});
			obj.jobDetails = findJobs;
			obj.companyDetails = findCompany;

			return getResponse(res, 200, 1, Messages.GET_REVIEW_LIST, obj);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateReviewById = async (req, res, next) => {
	try {
		const { id, rating, name, review } = req.body;
		const findReview = await reviews.findOne({
			_id: id,
			isActive: true,
		});

		if (findReview) {
			if (rating) {
				findReview.rating = rating;
			}

			if (name) {
				findReview.name = name;
			}

			if (review) {
				findReview.review = review;
			}

			findReview.save();

			return getResponse(res, 200, 1, Messages.REVIEW_UPDATE, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteReviewById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const findReview = await reviews.findOne({
			_id: id,
			isActive: true,
		});

		if (findReview) {
			findReview.isActive = false;
			findReview.save();

			return getResponse(res, 200, 1, Messages.REVIEW_DELETE, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
