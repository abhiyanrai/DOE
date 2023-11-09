const express = require("express");
const productController = require("../controllers/products");
const isAuthUser = require("../middleware/isAuthUser");
const router = express.Router();

router.get("/", (req, res, next) => {
	res.send("response from products route");
});

router.get(
	"/getAllProductsByCategoryAndSubCategory",
	isAuthUser,
	productController.getAllProductsByCategoryAndSubCategory
);

router.get(
	"/getProductDetailsById",
	isAuthUser,
	productController.getProductDetailsById
);

router.post("/addToCart", isAuthUser, productController.addToCart);

router.get("/getAllCartItems", isAuthUser, productController.getAllCartItems);

router.put("/updateQuantity", isAuthUser, productController.updateQuantity);

router.post("/addToWishList", isAuthUser, productController.addToWishList);

router.get(
	"/getAllWishListProducts",
	isAuthUser,
	productController.getAllWishListProducts
);

router.put(
	"/addAndUpdateAddress",
	isAuthUser,
	productController.addAndUpdateAddress
);

module.exports = router;
