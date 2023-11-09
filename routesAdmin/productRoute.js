const express = require("express");
const productController = require("../controllersAdmin/productsController");
const isAuthAdmin = require("../middleware/isAuthAdmin");
const { check } = require("express-validator");
const { checker } = require("../middleware/bodyChecker");
const { Messages } = require("../utils/constant");
const router = express.Router();

// Create a product
router.post(
	"/createProduct",
	isAuthAdmin,
	// [
	// 	check("name").notEmpty().withMessage(Messages.PRODUCT_NAME_REQUIRED),
	// 	check("category").notEmpty().withMessage(Messages.PRODUCT_CATEGORY_REQUIRED),
	// 	check("subcategory").notEmpty().withMessage(Messages.PRODUCT_SUBCATEGORY_REQUIRED),
	//     check("price").notEmpty().withMessage(Messages.PRODUCT_PRICE_REQUIRED),
	//     check("discount").notEmpty().withMessage(Messages.PRODUCT_DISCOUNT_REQUIRED),
	//     // check("productImage").notEmpty().withMessage(Messages.PRODUCT_IMAGE_REQUIRED),
	//     check("desc").notEmpty().withMessage(Messages.PRODUCT_DESC_REQUIRED),
	//     check("size").notEmpty().withMessage(Messages.PRODUCT_SIZE_REQUIRED),
	//     check("color").notEmpty().withMessage(Messages.PRODUCT_COLOR_REQUIRED),
	//     check("remainingIs").notEmpty().withMessage(Messages.PRODUCT_REMAINING_REQUIRED),
	//     check("shopId").notEmpty().withMessage(Messages.SHOP_ID_REQUIRED),
	// ],
	checker,
	productController.createProducts
);

// Get all products by shopId
router.get(
	"/getAllProductsByShopId",
	isAuthAdmin,
	productController.getAllProductsByShopId
);

// Get product details by product ID
router.get(
	"/getProductDetailsById",
	isAuthAdmin,
	productController.getProductDetailsById
);

// Update product details
router.put(
	"/updateProductDetails",
	isAuthAdmin,
	check("id").notEmpty().withMessage(Messages.PRODUCT_ID_REQUIRED),
	checker,
	productController.updateProductDetails
);

// Delete a product by ID
router.delete(
	"/deleteProductById",
	isAuthAdmin,
	productController.deleteProductById
);

module.exports = router;
