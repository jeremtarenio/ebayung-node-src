const { createUser, getUsers, getUserById, updateUser, deleteUserById, login, checkIfEmailExists, getUserInfo, updatePassword } = require("./user.controller");
const router = require("express").Router();

const { checkToken, checkIfAdmin, checkIfOwner } = require("../../auth/token_validation");

// /api/users
router.post("/", createUser);
router.get("/", checkToken, checkIfAdmin, getUsers);
router.get("/:userId", checkToken, checkIfAdmin, getUserById);
router.get("/:userId/info", checkToken, checkIfOwner, getUserInfo);
router.patch("/", checkToken, checkIfOwner, updateUser);
router.patch("/update-password", checkToken, checkIfOwner, updatePassword);
router.delete("/:id", checkToken, checkIfAdmin, deleteUserById);

router.post("/login", login);

router.post("/check-email", checkIfEmailExists);

module.exports = router;