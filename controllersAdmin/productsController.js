const { Products } = require("../modelsAdmin/products");
const { Shops } = require("../modelsAdmin/shop");
const { Messages } = require("../utils/constant");
const _ = require("lodash");

const getResponse = (res, resStatus, status, message, data) => {
	return res.status(resStatus).json({ status, message, data });
};

const getError = (res, errStatus, errors) => {
	res.status(errStatus).json({ errors });
};

// Create a product
exports.createProducts = async (req, res, next) => {
	try {
		const { shopId, products } = req.body;
		const findShopById = await Shops.findOne({ _id: shopId, isActive: true });

		if (!findShopById) {
			return getResponse(res, 409, 0, Messages.SHOP_NOT_FOUND, {});
		}

		const existingProductNames = await Products.find({
			name: { $in: products.map((product) => product.name) },
		});

		if (existingProductNames.length > 0) {
			return getResponse(res, 409, 0, Messages.PRODUCT_NAME_ALREADY_EXIST, {});
		}

		const productsToInsert = products.map((productData) => ({
			createdBy: req.adminId,
			shopId: findShopById._id,
			...productData,
		}));

		const createdProducts = await Products.insertMany(productsToInsert);
		return getResponse(res, 200, 1, Messages.PRODUCTS_CREATED, createdProducts);
	} catch (error) {
		console.error("Error creating products:", error);
		return res.status(500).json({
			status: 0,
			message: Messages.SOMETHING_WENT_WRONG,
		});
	}
};

// Get product details by product ID
exports.getProductDetailsById = async (req, res, next) => {
	try {
		const { id } = req.query;
		const product = await Products.findOne({ _id: id, isActive: true });

		if (!product) {
			return getResponse(res, 200, 0, Messages.PRODUCT_NOT_FOUND, {});
		}

		return getResponse(res, 200, 1, Messages.PRODUCT_DETAILS_FETCHED, product);
	} catch (error) {
		console.error("Error getting product details:", error);
		return res.status(500).json({
			status: 0,
			message: Messages.SOMETHING_WENT_WRONG,
		});
	}
};

// Update product details
exports.updateProductDetails = async (req, res, next) => {
	try {
		const updateProduct = _.pick(req.body, _.without(_.keys(req.body), "id"));
		const updatedProduct = await Products.findByIdAndUpdate(
			req.body.id,
			updateProduct,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!updatedProduct) {
			return getResponse(res, 200, 0, Messages.PRODUCT_NOT_FOUND, {});
		}

		return getResponse(res, 200, 1, Messages.PRODUCT_UPDATED, updatedProduct);
	} catch (error) {
		console.error("Error updating product details:", error);
		return res.status(500).json({
			status: 0,
			message: Messages.SOMETHING_WENT_WRONG,
		});
	}
};

// Delete a product by ID
exports.deleteProductById = async (req, res, next) => {
	try {
		const { id: productId } = req.query;
		const deleteProduct = await Products.findByIdAndDelete(
			productId,
			{ isActive: false },
			{ new: true }
		);

		if (!deleteProduct) {
			return getResponse(res, 409, 0, Messages.PRODUCT_NOT_FOUND, {});
		}

		return getResponse(res, 200, 1, Messages.PRODUCT_DELETED, deleteProduct);
	} catch (error) {
		console.error("Error deleting product:", error);
		return res.status(500).json({
			status: 0,
			message: Messages.SOMETHING_WENT_WRONG,
		});
	}
};

// Get all products by shop ID
exports.getAllProductsByShopId = async (req, res, next) => {
	try {
		const { id: shopId, page, limit, search } = req.query;
		const skip = limit * page - limit;
		const regexSearch = new RegExp(search, "i");
		const query = {
			isActive: true,
			createdBy: req.adminId,
			$or: [{ name: regexSearch }],
		};

		const getAllProducts = await Products.find({ shopId, ...query });

		if (!getAllProducts || getAllProducts.length === 0) {
			return getResponse(res, 200, 0, Messages.PRODUCT_NOT_FOUND, {});
		}

		const allProducts = await Products.find({ shopId, ...query })
			.skip(skip)
			.limit(limit)
			.sort({ updatedAt: -1 });

		return getResponse(res, 200, 1, Messages.PRODUCT_DETAILS_FETCHED, {
			totalData: getAllProducts.length,
			allProductsData: allProducts,
		});
	} catch (error) {
		console.error("Error fetching products:", error);
		return res.status(500).json({
			status: 0,
			message: Messages.SOMETHING_WENT_WRONG,
		});
	}
};
