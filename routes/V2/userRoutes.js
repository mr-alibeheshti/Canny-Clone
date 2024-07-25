const express = require("express");
const router = express.Router();
const {
	login,
	PasswordReset,
	forgetPassword,
	deleteAccount,
} = require("../../controllers/V1/userController");
const { signUPV2 } = require("../../controllers/V2/userController");

router.route("/signup").get(signUPV2);
router.route("/login").post(login);
router.route("/password_reset").post(PasswordReset);
router.route("/forget_password").post(forgetPassword);
router.delete("/deleteMe", deleteAccount);

module.exports = router;
