const { getOrdersByUserId, getOrderItems } = require("./order.controller");
const router = require("express").Router();

const { checkToken, checkIfOwner } = require("../../auth/token_validation");

router.get("/:userId", getOrdersByUserId);
router.get("/:userId/:orderId/items", getOrderItems);

module.exports = router;
