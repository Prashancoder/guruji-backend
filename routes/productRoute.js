const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReview,
  getAdminProducts,
} = require("../controllers/productController");

const router = express.Router();

router.route("/products").get(getAllProducts);

router
  .route("/admin/products")
  .get(getAdminProducts);

router
  .route("/admin/product/new")
  .post(createProduct);

router
  .route("/admin/product/:id")
  .put(updateProduct)
  .delete(deleteProduct);

router.route("/product/:id").get(getProductDetails);

router.route("/review").put(createProductReview);

router
  .route("/reviews")
  .get(getProductReviews)
  .delete(deleteReview);

module.exports = router;
