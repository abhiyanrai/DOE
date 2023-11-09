const { company } = require("../modelsAdmin/company");
const { industryAndSkills } = require("../modelsAdmin/industry&Skills");
const { Messages } = require("../utils/constant");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.addCompany = async (req, res, next) => {
	try {
		const {
			name,
			logo,
			emailAddress,
			phoneNumber,
			url,
			description,
			salaryRange,
			rangeSelector,
			locality,
			industry,
		} = req.body;

		const findCompany = await company.find({ name: name, isActive: true });
		if (findCompany.length > 0) {
			return getResponse(res, 409, 0, Messages.ALREADY_EXIST, {});
		} else {
			const addCom = await company.create({
				name,
				logo,
				emailAddress,
				phoneNumber,
				url,
				description,
				salaryRange,
				rangeSelector,
				locality,
				industry,
			});

			if (addCom) {
				return getResponse(res, 200, 1, Messages.COMPANY_ADDED, addCom);
			} else {
				return getError(res, 500, {
					status: 0,
					message: Messages.SOMETHING_WENT_WRONG,
				});
			}
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllCompaniesList = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;
		const skip = limit * page - limit;

		const findAllCompany = await company.find({
			isActive: true,
			name: { $regex: search, $options: "i" },
		});

		const findCompany = await company
			.find({ isActive: true, name: { $regex: search, $options: "i" } })
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		if (findCompany.length > 0) {
			return res.status(200).json({
				status: 1,
				message: Messages.GET_COMPANY_LIST,
				totalData: findAllCompany.length,
				currentPage: page ? page : 1,
				data: findCompany,
			});
			// return getResponse(res, 200, 1, Messages.GET_COMPANY_LIST, findCompany);
		} else {
			return res.status(200).json({
				status: 0,
				message: Messages.DATA_NOT_FOUND,
				totalData: findAllCompany.length,
				currentPage: page ? page : 1,
				data: [],
			});
			// return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getCompanyDetailsById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const isComExist = await company.findOne({
			_id: id,
			isActive: true,
		});
		if (!isComExist) {
			return getResponse(res, 200, 0, Messages.COMPANY_NOT_FOUND, {});
		} else {
			// const data = JSON.parse(JSON.stringify(isComExist));
			// const findCom = await company.findOne({
			// 	_id: isComExist.companyId,
			// 	isActive: true,
			// });
			// data.companyDetails = findCom;
			return getResponse(res, 200, 1, Messages.COMPANY_DATA, isComExist);
		}
	} catch (error) {
		console.log(
			"🚀 ~ file: companyController.js:98 ~ exports.getCompanyDetailsById= ~ error:",
			error
		);
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateSalaryRangeSelector = async (req, res, next) => {
	try {
		const { id, status } = req.body;

		const findCompany = await company.findOne({
			_id: id,
			isActive: true,
		});
		if (findCompany) {
			if (status) {
				findCompany.rangeSelector = status;
			}
			findCompany.save();
			return getResponse(res, 200, 1, Messages.COMPANY_UPDATE, "");
		} else {
			return getResponse(res, 200, 0, Messages.COMPANY_NOT_FOUND, "");
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addIndustryAndSkills = async (req, res, next) => {
	try {
		const { name, type } = req.body;

		if (type != "industry" && type != "skill") {
			return getResponse(res, 400, 0, Messages.CHECK_VALIDATION, {});
		}

		const findIndustryAndSkills = await industryAndSkills.find({
			name,
			type,
			isActive: true,
		});

		if (findIndustryAndSkills.length > 0) {
			return getResponse(res, 409, 0, Messages.ALREADY_EXIST, {});
		} else {
			const addfindIndustryAndSkills = await industryAndSkills.create({
				name,
				type,
				isActive: true,
			});

			if (addfindIndustryAndSkills) {
				return getResponse(
					res,
					200,
					1,
					type == "industry"
						? "industry" + Messages.ADD_INDUSTRY_OR_SKILL
						: "skill" + Messages.ADD_INDUSTRY_OR_SKILL,
					addfindIndustryAndSkills
				);
			} else {
				return getError(res, 500, {
					status: 0,
					message: Messages.SOMETHING_WENT_WRONG,
				});
			}
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllIndustryAndSkillsByType = async (req, res, next) => {
	try {
		const { type } = req.query;

		const isIndustryOrSkillExist = await industryAndSkills.find({
			type,
			isActive: true,
		});
		if (isIndustryOrSkillExist.length == 0) {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, []);
		} else {
			return getResponse(
				res,
				200,
				1,
				Messages.INDUSTRY_SKILLS_DATA,
				isIndustryOrSkillExist
			);
		}
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
