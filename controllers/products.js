const { ObjectId } = require("mongodb");
const { Products } = require("../modelsAdmin/products");
const { Messages } = require("../utils/constant");
const { myCart } = require("../models/myCart");
const { wishList } = require("../models/wishList");
const { Shops } = require("../modelsAdmin/shop");
const { removeDuplicates } = require("../utils/functions");
const { userAddress } = require("../models/userAddress");

// Common *****************************************************

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

exports.getAllProductsByCategoryAndSubCategory = async (req, res, next) => {
	try {
		const { category, subcategory } = req.query;

		let query = {};

		if (category != "" && category != undefined) {
			query.category = category;
		}

		if (subcategory != "" && subcategory != undefined) {
			query.subcategory = subcategory;
		}

		const [findAllProducts] = await Promise.all([
			Products.aggregate([
				{
					$lookup: {
						from: "shops",
						localField: "shopId",
						foreignField: "_id",
						as: "shopDetails",
					},
				},
				{
					$match: {
						isActive: true,
						...query,
					},
				},
				{
					$project: {
						_id: 1,
						createdBy: 1,
						name: 1,
						category: 1,
						subcategory: 1,
						price: 1,
						discount: 1,
						productImage: 1,
						desc: 1,
						size: 1,
						color: 1,
						isActive: 1,
						shopId: 1,
						status: 1,
						remainingIs: 1,
						createdAt: 1,
						updatedAt: 1,
						__v: 1,
						"shopDetails._id": 1,
						"shopDetails.name": 1,
						"shopDetails.location": 1,
						"shopDetails.numberOfProducts": 1,
						"shopDetails.totalSell": 1,
						"shopDetails.isActive": 1,
					},
				},
			]).sort({ createdAt: -1 }),
		]);

		return getResponse(
			res,
			200,
			1,
			Messages.PRODUCT_DETAILS_FETCHED,
			findAllProducts
		);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getProductDetailsById = async (req, res) => {
	try {
		const { productId } = req.query;

		if (!productId) {
			return getResponse(res, 400, 0, Messages.PRODUCT_ID_REQUIRED);
		}

		const findProductById = await Products.aggregate([
			{
				$lookup: {
					from: "shops",
					localField: "shopId",
					foreignField: "_id",
					as: "shopDetails",
				},
			},
			{
				$match: {
					isActive: true,
					_id: new ObjectId(productId),
				},
			},
		]);

		if (findProductById.length == 0) {
			return getResponse(res, 200, 0, Messages.PRODUCT_NOT_FOUND, []);
		}

		return getResponse(
			res,
			200,
			1,
			Messages.PRODUCT_DETAILS_FETCHED,
			findProductById
		);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addToCart = async (req, res) => {
	try {
		const { productId, quantity } = req.body;
		const { userId } = req;

		if (!productId || !quantity) {
			return getResponse(res, 400, 0, Messages.VALID_DATA_PROVIDE);
		}

		const findProductById = await Products.findOne({
			_id: productId,
			isActive: true,
		});

		if (!findProductById) {
			return getResponse(res, 400, 0, Messages.PRODUCT_NOT_FOUND);
		}

		const findMyCart = await myCart.findOne({ userId, isActive: true });

		if (findMyCart) {
			const findAlreayExist = findMyCart.productDetails.filter(
				(e) => e.productId == productId
			);

			if (findAlreayExist.length) {
				const findExist = findMyCart.productDetails.filter(
					(e) => e.productId != productId
				);

				let totalQuantity = findAlreayExist[0].quantity + quantity;
				let totalAmount =
					findAlreayExist[0].amount + parseInt(findProductById.price);

				findMyCart.productDetails = [
					...findExist,
					{
						productId: productId,
						amount: totalAmount,
						quantity: totalQuantity,
					},
				];

				var totalCartAmount = findMyCart.productDetails.reduce(
					(accum, item) => accum + item.amount,
					0
				);

				findMyCart.cartTotal = totalCartAmount;
				findMyCart.save();

				return getResponse(
					res,
					200,
					1,
					Messages.PRODUCT_ADDED_TO_CART,
					findMyCart
				);
			}

			findMyCart.productDetails = [
				...findMyCart.productDetails,
				{
					productId: productId,
					amount: parseInt(findProductById.price) * parseInt(quantity),
					quantity: quantity,
				},
			];

			var totalCartAmount = findMyCart.productDetails.reduce(
				(accum, item) => accum + item.amount,
				0
			);

			findMyCart.cartTotal = totalCartAmount;
			findMyCart.save();

			return getResponse(
				res,
				200,
				1,
				Messages.PRODUCT_ADDED_TO_CART,
				findMyCart
			);
		}

		const addToMyCart = await myCart.create({
			productDetails: {
				productId: productId,
				amount: parseInt(findProductById.price) * parseInt(quantity),
				quantity: quantity,
			},
			cartTotal: parseInt(findProductById.price) * parseInt(quantity),
			userId,
		});

		if (addToMyCart) {
			return getResponse(
				res,
				200,
				1,
				Messages.PRODUCT_ADDED_TO_CART,
				addToMyCart
			);
		}

		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllCartItems = async (req, res) => {
	try {
		const { userId } = req;

		const findMyCart = await myCart.findOne({ userId, isActive: true }).lean();

		if (findMyCart) {
			const uniqueIds = [
				...new Set(
					findMyCart.productDetails.map((item) => new ObjectId(item.productId))
				),
			];

			if (uniqueIds.length) {
				const findAllProducts = await Products.aggregate([
					{
						$lookup: {
							from: "shops",
							localField: "shopId",
							foreignField: "_id",
							as: "shopDetails",
						},
					},
					{
						$match: {
							isActive: true,
							_id: {
								$in: uniqueIds,
							},
						},
					},
				]);

				findMyCart.productDetails.map((item) => {
					const findAll = findAllProducts.find(
						(product) => item.productId == product._id
					);
					if (findAll) {
						item.productDetails = findAll;
						item.productDetails.shopDetails = findAll.shopDetails[0];
					}
					return item;
				});
			}
		}

		return getResponse(
			res,
			200,
			1,
			Messages.CART_DATA_FETCHED,
			findMyCart ? findMyCart : {}
		);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.updateQuantity = async (req, res) => {
	try {
		const { productId, quantity } = req.body;
		const { userId } = req;

		if (!productId || !quantity) {
			return getResponse(res, 400, 0, Messages.VALID_DATA_PROVIDE);
		}

		const findProductById = await Products.findOne({
			_id: productId,
			isActive: true,
		});

		if (!findProductById) {
			return getResponse(res, 400, 0, Messages.PRODUCT_NOT_FOUND);
		}

		const findMyCart = await myCart.findOne({ userId, isActive: true });

		if (findMyCart) {
			const findAlreayExist = findMyCart.productDetails.filter(
				(e) => e.productId == productId
			);

			if (findAlreayExist.length) {
				const findExist = findMyCart.productDetails.filter(
					(e) => e.productId != productId
				);

				let totalQuantity = quantity;
				let totalAmount = parseInt(findProductById.price) * parseInt(quantity);

				findMyCart.productDetails = [
					...findExist,
					{
						productId: findAlreayExist[0].productId,
						amount: totalAmount,
						quantity: totalQuantity,
					},
				];

				var totalCartAmount = findMyCart.productDetails.reduce(
					(accum, item) => accum + item.amount,
					0
				);

				findMyCart.cartTotal = totalCartAmount;
				findMyCart.save();

				return getResponse(
					res,
					200,
					1,
					Messages.PRODUCT_ADDED_TO_CART,
					findMyCart
				);
			}

			return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND, {});
		}

		return getResponse(res, 200, 0, Messages.CART_DATA_NOT_FOUND, {});
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addToWishList = async (req, res) => {
	try {
		const { productId, shopId } = req.body;
		const { userId } = req;

		if (!productId || !shopId) {
			return getResponse(res, 400, 0, Messages.VALID_DATA_PROVIDE);
		}

		const findProductById = await Products.findOne({
			_id: productId,
			isActive: true,
		});

		if (findProductById) {
			const findShop = await Shops.findOne({ _id: shopId, isActive: true });

			if (findShop) {
				const findProductInWishList = await wishList.findOne({
					productId,
					shopId,
					userId,
					isActive: true,
				});

				if (findProductInWishList) {
					return getResponse(
						res,
						409,
						0,
						Messages.ALREADY_EXIST_IN_WISHLIST,
						{}
					);
				}

				const addProductInWishList = await wishList.create({
					productId,
					shopId,
					userId,
				});

				if (addProductInWishList) {
					return getResponse(
						res,
						200,
						1,
						Messages.PRODUCT_ADDED_TO_WISHLIST,
						addProductInWishList
					);
				}

				return res
					.status(500)
					.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
			}

			return getResponse(res, 200, 0, Messages.SHOP_DATA_NOT_FOUND);
		}

		return getResponse(res, 200, 0, Messages.PRODUCT_NOT_FOUND);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.getAllWishListProducts = async (req, res) => {
	try {
		const { userId } = req;

		const findAllWishListProducts = await wishList
			.find({
				userId,
				isActive: true,
			})
			.lean();

		if (findAllWishListProducts.length) {
			const uniqueIds = removeDuplicates(findAllWishListProducts, "productId");

			if (uniqueIds.length) {
				const findAllProducts = await Products.aggregate([
					{
						$lookup: {
							from: "shops",
							localField: "shopId",
							foreignField: "_id",
							as: "shopDetails",
						},
					},
					{
						$match: {
							isActive: true,
							_id: {
								$in: uniqueIds,
							},
						},
					},
				]);

				findAllWishListProducts.map((item) => {
					const findAll = findAllProducts.find((product) =>
						item.productId.equals(product._id)
					);
					if (findAll) {
						item.productDetails = findAll;
						item.productDetails.shopDetails = findAll.shopDetails[0];
					}
					return item;
				});

				return getResponse(
					res,
					200,
					1,
					Messages.PRODUCT_WISHLIST_FETCHED,
					findAllWishListProducts
				);
			}
		}

		return getResponse(res, 200, 0, Messages.DATA_NOT_FOUND);
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};

exports.addAndUpdateAddress = async (req, res) => {
	try {
		const {
			addressType,
			fullName,
			phone,
			state,
			city,
			zipCode,
			country,
			address,
			landmark,
		} = req.body;

		const { userId } = req;

		const findAddress = await userAddress.findOne({
			addressType,
			userId,
		});

		if (findAddress) {
			if (addressType) {
				findAddress.addressType = addressType;
			}
			if (fullName) {
				findAddress.fullName = fullName;
			}
			if (phone) {
				findAddress.phone = phone;
			}
			if (state) {
				findAddress.state = state;
			}
			if (city) {
				findAddress.city = city;
			}
			if (zipCode) {
				findAddress.zipCode = zipCode;
			}
			if (country) {
				findAddress.country = country;
			}
			if (address) {
				findAddress.address = address;
			}
			if (landmark) {
				findAddress.landmark = landmark;
			}

			findAddress.save();
			return getResponse(res, 200, 1, "Address updated", findAddress);
		}

		const addAddress = await userAddress.create({
			addressType,
			userId: userId,
			fullName,
			phone,
			state,
			city,
			zipCode,
			country,
			address,
			landmark,
		});

		if (addAddress) {
			return getResponse(res, 200, 1, "Address added", addAddress);
		}

		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	} catch (error) {
		return res
			.status(500)
			.json({ status: 0, message: Messages.SOMETHING_WENT_WRONG });
	}
};
