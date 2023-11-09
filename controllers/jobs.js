const { Messages } = require("../utils/constant");
const { savedJobs } = require("../models/savedJobs");
const { User } = require("../models/users");
const { company } = require("../modelsAdmin/company");
const { jobs } = require("../modelsAdmin/jobs");
const { candidates } = require("../modelsAdmin/candidate");
const { reviews } = require("../modelsAdmin/review");
const moment = require("moment");
const { jobRecentSearch } = require("../models/jobRecentSearch");
const {
	calculateTimeDifference,
	removeDuplicates,
} = require("../utils/functions");
const { ObjectId } = require("mongodb");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.addSavedJob = async (req, res, next) => {
	try {
		const { userId } = req;
		const { jobId, companyId, status } = req.body;

		const findUser = await User.findOne({ _id: userId, isActive: true });

		if (findUser) {
			const findCom = await company.findOne({ _id: companyId, isActive: true });
			if (findCom) {
				const findJob = await jobs.findOne({
					_id: jobId,
					isActive: true,
				});
				if (findJob) {
					const findSavedJobs = await savedJobs.findOne({
						jobId,
						companyId,
						userId: userId,
						isActive: true,
					});
					if (findSavedJobs) {
						findSavedJobs.isActive = status;
						findSavedJobs.save();

						let msg = status
							? Messages.JOB_SAVED_TO_LIST
							: Messages.REMOVE_SAVED_JOB;

						return getResponse(res, 200, 1, msg, "");
					} else {
						const addSavedJob = new savedJobs({
							jobId,
							companyId,
							userId: userId,
						});
						await addSavedJob.save();
						return getResponse(res, 200, 1, Messages.JOB_SAVED_TO_LIST, "");
						// return getResponse(res, 409, 0, Messages.ALREADY_EXIST, {});
					}
				} else {
					return getResponse(res, 400, 0, Messages.JOB_NOT_FOUND, "");
				}
			} else {
				return getResponse(res, 400, 0, Messages.COMPANY_NOT_FOUND, "");
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

exports.getUserSavedJobs = async (req, res, next) => {
	try {
		const { userId } = req;
		const { search } = req.query;

		const findAllSavedJobs = await savedJobs
			.find({
				userId: userId,
				isActive: true,
			})
			.sort({ createdAt: -1 });

		if (findAllSavedJobs.length > 0) {
			let findJobIds = removeDuplicates(findAllSavedJobs, "jobId");

			const findAllJobs = await jobs.aggregate([
				{
					$lookup: {
						from: "companies",
						localField: "companyId",
						foreignField: "_id",
						as: "companyDetails",
					},
				},
				{
					$match: {
						_id: { $in: findJobIds },
						isActive: true,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},
			]);

			const findAllAppliedJobs = await candidates.find({
				jobId: { $in: findJobIds },
				userId: userId,
				isActive: true,
			});

			const arr = [];

			findAllSavedJobs.map(async (items) => {
				const findJob = findAllJobs.find((i) => i._id.equals(items.jobId));
				if (findJob && findJob.title.indexOf(search) !== -1) {
					let obj = JSON.parse(JSON.stringify(items));
					const findAppliedJobs = findAllAppliedJobs.find(
						(i) =>
							i.jobId.equals(items.jobId) && i.companyId.equals(items.companyId)
					);

					obj.isApplied = findAppliedJobs
						? findAppliedJobs.candidateStatus.length > 0
							? true
							: false
						: false;
					obj.candidateStatus = findAppliedJobs
						? findAppliedJobs.candidateStatus
						: [];

					obj.timeDuration = moment(obj.createdAt).format("DD-MM-YYYY");
					obj.companyDetails = findJob.companyDetails[0];
					delete findJob.companyDetails;
					obj.jobDetails = findJob;
					arr.push(obj);
				}
			});

			return getResponse(res, 200, 1, Messages.JOB_DATA, arr);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllJobListByUser = async (req, res, next) => {
	try {
		const { userId } = req;
		const { search, page, limit } = req.query;
		const skip = limit * page - limit;

		const findDataLength = await jobs.find({
			title: { $regex: search, $options: "i" },
			isActive: true,
		});

		const isJobExist = await jobs
			.aggregate([
				{
					$lookup: {
						from: "companies",
						localField: "companyId",
						foreignField: "_id",
						as: "companyDetails",
					},
				},
				{
					$match: {
						title: { $regex: search, $options: "i" },
						isActive: true,
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},
			])
			.skip(skip)
			.limit(parseInt(limit));

		if (isJobExist.length == 0) {
			return res.status(200).json({
				status: 0,
				message: Messages.DATA_NOT_FOUND,
				totalLength: findDataLength.length,
				data: [],
			});
		} else {
			const uniqueJobIds = removeDuplicates(isJobExist, "_id");

			const findAllAppliedJobs = await candidates.find({
				jobId: { $in: uniqueJobIds },
				userId: userId,
				isActive: true,
			});

			const findAllSavedJobs = await savedJobs.find({
				userId: userId,
				jobId: { $in: uniqueJobIds },
				isActive: true,
			});

			const arr = [];

			isJobExist.map(async (jobs) => {
				const element = JSON.parse(JSON.stringify(jobs));
				const findAppliedJobs = findAllAppliedJobs.find(
					(i) =>
						i.jobId.equals(element._id) && i.companyId.equals(element.companyId)
				);

				if (!findAppliedJobs) {
					const findSavedJobs = findAllSavedJobs.find(
						(i) =>
							i.jobId.equals(element._id) &&
							i.companyId.equals(element.companyId)
					);
					element.isSaved = Boolean(findSavedJobs);

					arr.push({ ...element, companyDetails: jobs.companyDetails[0] });
				}
			});

			return res.status(200).json({
				status: 1,
				message: Messages.JOB_DATA,
				totalLength: findDataLength.length,
				data: arr,
			});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getJobDetailsById = async (req, res, next) => {
	try {
		const { id } = req.query;

		const { userId } = req;
		const isJobExist = await jobs.findOne({
			_id: id,
			isActive: true,
		});
		if (!isJobExist) {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		} else {
			const data = JSON.parse(JSON.stringify(isJobExist));
			const findCom = await company.findOne({
				_id: isJobExist.companyId,
				isActive: true,
			});

			const findReview = await reviews.find({
				jobId: isJobExist._id,
				isActive: true,
			});

			let sum = 0;

			let arr = [];

			findReview.forEach((item) => {
				const JsonData = JSON.parse(JSON.stringify(item));
				JsonData.data = moment().format("LL");
				arr.push(JsonData);
				sum += parseFloat(item.rating);
			});

			const findSavedJobs = await savedJobs.findOne({
				userId: userId,
				jobId: data._id,
				companyId: data.companyId,
				isActive: true,
			});

			const timeDifference = calculateTimeDifference(new Date(data.createdAt));

			data.isSaved = Boolean(findSavedJobs);
			data.timeDuration = timeDifference;
			data.averageRating =
				arr.length > 0 ? (sum / arr.length).toFixed(1) : "0.0";
			data.reviewsDetails = arr;
			data.totalReviews = arr.length;
			data.companyDetails = findCom ? findCom : {};
			return getResponse(res, 200, 1, Messages.JOB_DATA, data);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllMyAppliedJobs = async (req, res, next) => {
	try {
		const { userId } = req;
		const isJobAppliedExist = await candidates
			.aggregate([
				{
					$lookup: {
						from: "jobs",
						localField: "jobId",
						foreignField: "_id",
						as: "jobDetails",
					},
				},
				{
					$match: {
						isActive: true,
						userId: new ObjectId(userId),
					},
				},
			])
			.sort({ createdAt: -1 });

		if (isJobAppliedExist.length == 0) {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		} else {
			let arr = [];

			const uniqueCompanyIds = removeDuplicates(isJobAppliedExist, "companyId");

			const findAllCom = await company.find({
				_id: { $in: uniqueCompanyIds },
				isActive: true,
			});

			const uniqueJobIds = removeDuplicates(isJobAppliedExist, "jobId");

			const findAllSavedJobs = await savedJobs.find({
				userId: userId,
				jobId: { $in: uniqueJobIds },
				isActive: true,
			});

			isJobAppliedExist.map(async (element) => {
				const obj = JSON.parse(JSON.stringify(element));

				const findCom = findAllCom.find((i) => i._id.equals(element.companyId));

				const findSavedJobs = findAllSavedJobs.find(
					(i) =>
						i.companyId.equals(element.companyId) &&
						i.jobId.equals(element.jobId)
				);

				obj.isSaved = Boolean(findSavedJobs);

				let a = moment(obj.createdAt).format("DD MMMM YYYY");
				obj.timeDuration = a;

				const result = obj.candidateStatus.filter(
					(item) => item.hasOwnProperty("current") || item.current
				);

				if (result.length == 0) {
					const result1 = obj.candidateStatus.filter(
						(item) => item.status == 1 && item.current == true
					);
					if (result1.length > 0) {
						obj.applicationStatus = result1[0].name;
					} else {
						const result2 = obj.candidateStatus.filter(
							(item) => item.status == 1
						);
						obj.applicationStatus = result2.length > 0 ? result2[0].name : "";
					}
				} else {
					obj.applicationStatus = result.length > 0 ? result[0].name : "";
				}

				if (findCom) {
					obj.jobDetails = obj.jobDetails[0];
					obj.companyDetails = findCom;
					arr.push(obj);
					return obj;
				}
			});

			return getResponse(res, 200, 1, Messages.APPLIED_DATE_FETCHED, arr);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.applyForJob = async (req, res, next) => {
	try {
		const { userId } = req;
		const { jobId, companyId, resume, city } = req.body;

		const findUser = await User.findOne({ _id: userId, isActive: true });

		if (findUser) {
			const findCom = await company.findOne({ _id: companyId, isActive: true });
			if (findCom) {
				const findJob = await jobs.findOne({
					_id: jobId,
					isActive: true,
				});
				if (findJob) {
					const findAppliedJobs = await candidates.findOne({
						jobId,
						companyId,
						userId: userId,
						isActive: true,
					});
					if (!findAppliedJobs) {
						const addAppliedJob = new candidates({
							jobId,
							companyId,
							userId: userId,
							city,
							resume,
						});
						await addAppliedJob.save();
						return getResponse(res, 200, 1, Messages.JOB_APPLIED, "");
					} else {
						return getResponse(res, 409, 0, Messages.JOB_ALREADY_EXIST, {});
					}
				} else {
					return getResponse(res, 400, 0, Messages.JOB_NOT_FOUND, "");
				}
			} else {
				return getResponse(res, 400, 0, Messages.COMPANY_NOT_FOUND, "");
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

exports.getAllSimilarJobs = async (req, res, next) => {
	try {
		const { userId } = req;
		const { id } = req.query;
		const isJobExist = await jobs.findOne({
			_id: id,
			isActive: true,
		});
		if (!isJobExist) {
			return getResponse(res, 200, 0, Messages.JOB_NOT_FOUND, []);
		} else {
			const isSimilarExist = await jobs
				.aggregate([
					{
						$match: {
							isActive: true,
							skillsRequired: { $in: [...isJobExist.skillsRequired] },
						},
					},
					{
						$lookup: {
							from: "companies",
							localField: "companyId",
							foreignField: "_id",
							as: "companyDetails",
						},
					},
				])
				.sort({ createdAt: -1 });

			const arr = [];

			const JobIds = removeDuplicates(isSimilarExist, "_id");

			const findAllSavedJobs = await savedJobs.find({
				userId: userId,
				jobId: { $in: JobIds },
				isActive: true,
			});

			isSimilarExist.map(async (data) => {
				const element = JSON.parse(JSON.stringify(data));
				if (element._id != id) {
					const findSavedJobs = findAllSavedJobs.find(
						(i) =>
							i.companyId.equals(element.companyId) &&
							i.jobId.equals(element._id)
					);
					element.isSaved = Boolean(findSavedJobs);
					arr.push({
						...element,
						companyDetails: element.companyDetails[0],
					});
				}
			});

			return getResponse(res, 200, 1, Messages.JOB_DATA, arr);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllRecentsJobPosts = async (req, res, next) => {
	try {
		const { userId } = req;

		const isRecentJobExist = await jobs
			.aggregate([
				{
					$match: {
						isActive: true,
					},
				},
				{
					$lookup: {
						from: "companies",
						localField: "companyId",
						foreignField: "_id",
						as: "companyDetails",
					},
				},
			])
			.limit(10)
			.sort({ createdAt: -1 });

		const arr = [];

		const JobIds = removeDuplicates(isRecentJobExist, "_id");

		const findAllSavedJobs = await savedJobs.find({
			userId: userId,
			jobId: { $in: JobIds },
			isActive: true,
		});

		const findAllAppliedJobs = await candidates.find({
			jobId: { $in: JobIds },
			userId: userId,
			isActive: true,
		});
		for (let index = 0; index < isRecentJobExist.length; index++) {
			const element = JSON.parse(JSON.stringify(isRecentJobExist[index]));
			const findAppliedJobs = findAllAppliedJobs.find(
				(i) =>
					i.companyId.equals(element.companyId) && i.jobId.equals(element._id)
			);
			if (!findAppliedJobs) {
				const findSavedJobs = findAllSavedJobs.find(
					(i) =>
						i.companyId.equals(element.companyId) && i.jobId.equals(element._id)
				);
				element.isSaved = Boolean(findSavedJobs);
				arr.push({ ...element, companyDetails: element.companyDetails[0] });
			}
		}

		return getResponse(res, 200, 1, Messages.JOB_DATA, arr);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addJobSearch = async (req, res, next) => {
	try {
		const { userId } = req;
		const { title } = req.body;

		const findJobSearch = await jobRecentSearch.find({
			title: title,
			userId: userId,
		});

		if (findJobSearch.length > 0) {
			return getResponse(res, 200, 1, Messages.ADD_JOB_SEARCH, {});
		}

		const addJobSearch = await jobRecentSearch.create({
			title: title,
			userId: userId,
		});

		if (addJobSearch) {
			return getResponse(res, 200, 1, Messages.ADD_JOB_SEARCH, {});
		} else {
			return res
				.status(500)
				.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllJobSearches = async (req, res, next) => {
	try {
		const { userId } = req;

		const findJobSearch = await jobRecentSearch
			.find({
				userId: userId,
				isActive: true,
			})
			.limit(10);

		if (findJobSearch.length > 0) {
			return getResponse(res, 200, 1, Messages.GET_JOB_SEARCH, findJobSearch);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAppliedJobDetailsById = async (req, res, next) => {
	try {
		const { userId } = req;

		const { jobId } = req.query;

		const isJobAppliedExist = await candidates
			.findOne({
				jobId: jobId,
				isActive: true,
				userId: userId,
			})
			.lean();

		if (!isJobAppliedExist) {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		} else {
			const arr = [];
			const obj = isJobAppliedExist;

			const [findJob, findCom, findSavedJobs] = await Promise.all([
				jobs.findOne({
					_id: obj.jobId,
					isActive: true,
				}),
				company.findOne({
					_id: obj.companyId,
					isActive: true,
				}),
				savedJobs.findOne({
					userId: userId,
					jobId: obj.jobId,
					companyId: obj.companyId,
					isActive: true,
				}),
			]);

			obj.isSaved = Boolean(findSavedJobs);

			let b = obj.candidateStatus.filter((e) => {
				return e.status == 1 && e.current == true;
			});

			obj.applicationStatus = b?.[0]?.name;
			let a = moment(obj.createdAt).format("LL");
			obj.timeDuration = a;

			if (findJob && findCom) {
				obj.jobDetails = findJob;
				obj.companyDetails = findCom;
				arr.push(obj);
				return getResponse(res, 200, 1, Messages.APPLIED_DATE_FETCHED, arr);
			} else {
				return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
			}
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
