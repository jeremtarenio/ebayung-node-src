const { updateProduct ,getProductKeywords, adminGetProducts, getKeywords, getProducts, getProductById, getProductPhotosById, getProductReviewsById, getSubCategories, getCategories, getProductsByCategory, createProduct } = require("./product.controller");
const router = require("express").Router();

const { checkToken, checkIfAdmin } = require("../../auth/token_validation");

router.post("/", checkToken, checkIfAdmin, createProduct);
router.patch("/", checkToken, checkIfAdmin, updateProduct)

router.get("/", getProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);
router.get("/:id/photos", getProductPhotosById);
router.get("/:id/reviews", getProductReviewsById);
router.get("/:id/keywords", getProductKeywords); // product's keywords

router.get("/:category/sub-categories", getSubCategories);
router.get("/categories/get", getCategories);

router.get("/keywords/get", checkToken, checkIfAdmin, getKeywords); // all keywords
router.get("/admin/get", checkToken, checkIfAdmin, adminGetProducts)

module.exports = router;