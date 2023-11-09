const { Shops } = require("../modelsAdmin/shop");
const { Messages } = require("../utils/constant");
const _ = require("lodash");
// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.createShop = async (req, res, next) => {
	try {
		const { name, emailId, location, numberOfProduct, totalSell } = req.body;
		const existingShop = await Shops.findOne({ name, isActive: true });
		if (existingShop) {
			return getResponse(res, 409, 0, Messages.SHOP_NAME_ALREADY_EXIST, {});
		}
		const createShop = await Shops.create({
			createdBy: req.adminId,
			name,
			emailId,
			location,
			numberOfProduct,
			totalSell,
		});
		return getResponse(res, 200, 1, Messages.SHOP_CREATED, createShop);
	} catch (error) {
		console.error("Error creating shop:", error);
		return res.status(500).json({
			status: 0,
			message: Messages.SOMETHING_WENT_WRONG,
		});
	}
};

exports.getDetailsByShopId = async (req, res, next) => {
	try {
		const { id } = req.query;
		const shop = await Shops.findOne({ _id: id, isActive: true });
		if (!shop) {
			return getResponse(res, 200, 0, Messages.SHOP_DETAILS_NOT_FOUND, {});
		}
		return getResponse(res, 200, 1, Messages.SHOP_DATA_FETCHED, shop);
	} catch (error) {
		console.error("Error getting shop details:", error);
		return res.status(500).json({
			status: 0,
			message: Messages.SOMETHING_WENT_WRONG,
		});
	}
};

exports.updateShopDetails = async (req, res, next) => {
	try {
		const updateShop = _.pick(req.body, _.without(_.keys(req.body), "id"));
		const updatedShop = await Shops.findByIdAndUpdate(req.body.id, updateShop, {
			new: true,
			runValidators: true,
		});
		if (!updatedShop) {
			return getResponse(res, 400, 0, Messages.SHOP_DETAILS_NOT_FOUND, {});
		}
		return getResponse(res, 200, 1, Messages.SHOP_UPDATED, updatedShop);
	} catch (error) {
		console.error("Error updating shop details:", error);
		return res.status(500).json({
			status: 0,
			message: Messages.SOMETHING_WENT_WRONG,
		});
	}
};

exports.deleteShopById = async (req, res, next) => {
	try {
		const { id: shopId } = req.query;
		const deleteShop = await Shops.findByIdAndUpdate(
			shopId,
			{ isActive: false },
			{
				new: true,
			}
		);
		if (!deleteShop) {
			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		}
		return getResponse(res, 200, 1, Messages.SHOP_DELETED, deleteShop);
	} catch (error) {
		console.error("Error deleting shop:", error);
		return res.status(500).json({
			status: 0,
			message: Messages.SOMETHING_WENT_WRONG,
		});
	}
};

exports.getAllShopsByVendor = async (req, res, next) => {
	try {
		const { page, limit, search } = req.query;
		const skip = limit * page - limit;
		const regexSearch = new RegExp(search, "i");

		const query = {
			isActive: true,
			createdBy: req.adminId,
			$or: [{ name: regexSearch }, { emailId: regexSearch }],
		};

		const getAllShops = await Shops.find(query);

		if (!getAllShops || getAllShops.length === 0) {
			return getResponse(res, 200, 0, Messages.SHOP_NOT_FOUND, []);
		}

		const allShops = await Shops.find(query)
			.skip(skip)
			.limit(limit)
			.sort({ updatedAt: -1 });

		return getResponse(res, 200, 1, Messages.SHOP_DATA_FETCHED, {
			totalData: getAllShops.length,
			allShopsData: allShops,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
