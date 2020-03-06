const { getCartByUserId, addToCart, checkIfCartItemExists, updateCartItemQuantity,  deleteCartItem, getCartTotalByUserId} = require('./cart.controller');
const router = require("express").Router();

const { checkToken, checkIfOwner } = require("../../auth/token_validation");

router.get("/:userId", checkToken, checkIfOwner, getCartByUserId);
router.get("/total/:userId", checkToken, checkIfOwner, getCartTotalByUserId);
router.post("/", checkToken, checkIfOwner, addToCart);
router.post("/verify/check-cart-item-exists", checkToken, checkIfOwner, checkIfCartItemExists);
router.patch("/", checkToken, checkIfOwner, updateCartItemQuantity);
router.delete("/:userId/:productId", checkToken, checkIfOwner, deleteCartItem)

module.exports = router;
