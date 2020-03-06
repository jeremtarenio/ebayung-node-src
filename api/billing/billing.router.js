const { checkout } = require('./billing.controller');
const router = require("express").Router();
const { checkToken, checkIfOwner } = require("../../auth/token_validation");

router.post("/checkout", checkToken, checkIfOwner, checkout);

module.exports = router;