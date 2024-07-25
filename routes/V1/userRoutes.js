const express = require("express");
const router = express.Router();
const {
	signUP,
	login,
	PasswordReset,
	forgetPassword,
	deleteAccount,
} = require("../../controllers/V1/userController");

router.route("/signup").post(signUP);
router.route("/login").post(login);
router.route("/password_reset").post(PasswordReset);
router.route("/forget_password").post(forgetPassword);
router.delete("/deleteMe", deleteAccount);

module.exports = router;
