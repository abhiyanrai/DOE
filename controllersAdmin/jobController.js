const { Messages } = require("../utils/constant");
const { jobs } = require("../modelsAdmin/jobs");
const { company } = require("../modelsAdmin/company");
const { candidates } = require("../modelsAdmin/candidate");
const { User } = require("../models/users");
const moment = require("moment");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.addJobs = async (req, res, next) => {
	try {
		const {
			title,
			description,
			companyId,
			employmentType,
			skillsRequired,
			noOfPosition,
			workExp,
			salaryType,
		} = req.body;

		const findCompany = await company.find({ _id: companyId, isActive: true });
		if (findCompany.length > 0) {
			const findJob = await jobs.find({
				title: title,
				isActive: true,
				companyId: companyId,
			});
			if (findJob.length > 0) {
				return getResponse(res, 409, 0, Messages.ALREADY_EXIST, {});
			} else {
				const addJob = await jobs.create({
					title,
					description,
					companyId,
					employmentType,
					skillsRequired,
					noOfPosition,
					workExp,
					salaryType,
				});

				if (addJob) {
					return getResponse(res, 200, 1, Messages.JOB_ADDED, addJob);
				} else {
					return getError(res, 500, {
						status: 0,
						message: Messages.SOMETHING_WENT_WRONG,
					});
				}
			}
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
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

		const findJobs = await jobs.find({
			_id: id,
			isActive: true,
		});
		if (findJobs.length > 0) {
			const data = JSON.parse(JSON.stringify(findJobs[0]));
			const findCandidate = await candidates.find({
				jobId: id,
				isActive: true,
				companyId: data.companyId,
			});
			const data2 = JSON.parse(JSON.stringify(findCandidate));

			let arr = [];
			for (let index = 0; index < data2.length; index++) {
				const element = JSON.parse(JSON.stringify(data2[index]));
				const findUser = await User.findOne({
					_id: element.userId,
					isActive: true,
				});

				const result = element.candidateStatus.filter(
					(item) => item.hasOwnProperty("current") || item.current
				);

				if (result.length == 0) {
					const result1 = element.candidateStatus.filter(
						(item) => item.status == 1 && item.current == true
					);
					if (result1.length > 0) {
						element.userApplicationStatus = result1[0].name;
					} else {
						const result2 = element.candidateStatus.filter(
							(item) => item.status == 1
						);
						element.userApplicationStatus =
							result2.length > 0 ? result2[0].name : "";
					}
				} else {
					element.userApplicationStatus =
						result.length > 0 ? result[0].name : "";
				}
				const userData = JSON.parse(JSON.stringify(findUser));
				delete userData.password;
				delete userData.Otp;
				element.userDetails = userData;
				arr.push(element);
			}
			data.candidateDetails = arr;
			return getResponse(res, 200, 1, Messages.JOB_DATA, data);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.deleteJobById = async (req, res, next) => {
	try {
		const { id } = req.query;

		const findJobs = await jobs.findOne({
			_id: id,
			isActive: true,
		});
		if (findJobs) {
			findJobs.isActive = false;
			findJobs.save();
			return getResponse(res, 200, 1, Messages.JOB_DELETE, []);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateJobDetailsById = async (req, res, next) => {
	try {
		const {
			id,
			title,
			description,
			employmentType,
			skillsRequired,
			noOfPosition,
			workExp,
			salaryType,
		} = req.body;

		const findJobs = await jobs.findOne({
			_id: id,
			isActive: true,
		});
		if (findJobs) {
			if (title) {
				findJobs.title = title;
			}

			if (employmentType) {
				findJobs.employmentType = employmentType;
			}
			if (salaryType) {
				findJobs.salaryType = salaryType;
			}
			if (skillsRequired) {
				findJobs.skillsRequired = skillsRequired;
			}
			if (noOfPosition) {
				findJobs.noOfPosition = noOfPosition;
			}
			if (workExp) {
				findJobs.workExp = workExp;
			}

			if (description) {
				findJobs.description = description;
			}

			findJobs.save();
			return getResponse(res, 200, 1, Messages.JOB_UPDATE, findJobs);
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllJobList = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;
		const skip = limit * page - limit;

		const findDataLength = await jobs.find({
			title: { $regex: search, $options: "i" },
			isActive: true,
		});

		const isJobExist = await jobs
			.find({
				title: { $regex: search, $options: "i" },
				isActive: true,
			})
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		if (isJobExist.length == 0) {
			return res.status(200).json({
				status: 0,
				message: Messages.DATA_NOT_FOUND,
				totalLength: findDataLength.length,
				data: [],
			});
		} else {
			return res.status(200).json({
				status: 1,
				message: Messages.JOB_DATA,
				totalLength: findDataLength.length,
				data: isJobExist,
			});
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateUserApplicationStatus = async (req, res, next) => {
	try {
		const { userId, status, jobId } = req.body;

		const findJobs = await jobs.findOne({
			_id: jobId,
			isActive: true,
		});

		if (findJobs) {
			const findCandidate = await candidates.findOne({
				userId: userId,
				isActive: true,
				jobId: jobId,
			});

			let a = [];
			if (findCandidate) {
				let cS = [...findCandidate.candidateStatus];

				let ind = 0;

				for (let x of cS) {
					const element = x;
					if (element.name == status) {
						console.log(
							"🚀 ~ file: jobController.js:277 ~ exports.updateUserApplicationStatus= ~ element.name: ifff",
							element.name
						);
						element.status = 1;
						element.current = true;
						element.time = moment().format("LL");
						ind++;
						a.push(element);
						break;
					} else {
						console.log(
							"🚀 ~ file: jobController.js:277 ~ exports.updateUserApplicationStatus= ~ element.name: elseeee",
							element.name
						);
						delete element.current;
						element.status = 1;
						if (element.time == "") {
							element.time = moment().format("LL");
						}
						ind++;
						a.push(element);
					}
				}

				const filter = {
					userId: userId,
					isActive: true,
					jobId: jobId,
				};

				console.log(
					a,
					"...a...a...a...a",
					findCandidate.candidateStatus.slice(ind)
				);
				const update = {
					candidateStatus: [...a, ...findCandidate.candidateStatus.slice(ind)],
				};

				console.log(
					"🚀 ~ file: jobController.js:296 ~ exports.updateUserApplicationStatus= ~ update:",
					update
				);

				await candidates.findOneAndUpdate(filter, update);
			}

			return getResponse(res, 200, 1, Messages.JOB_APPLICATION_UPDATE, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateJobStatus = async (req, res, next) => {
	try {
		const { status, jobId } = req.body;

		const findJobs = await jobs.findOne({
			_id: jobId,
			isActive: true,
		});

		if (findJobs) {
			findJobs.jobStatus = status;
			findJobs.save();

			return getResponse(res, 200, 1, Messages.JOB_STATUS_UPDATE, "");
		} else {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
