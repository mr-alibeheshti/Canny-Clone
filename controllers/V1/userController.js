const User = require("../../models/UserModel");
const AppError = require("../../utils/AppError");
const { sendEmail } = require("../../utils/smtp");
const {
	signupSchema,
	loginSchema,
	passwordResetSchema,
	forgetPasswordSchema,
} = require("../../utils/validation");
const crypto = require("node:crypto");
// Sign Up
exports.signUP = async (req, res, next) => {
	const { error } = signupSchema.validate(req.body);
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}

	const { name, email, password, passwordConfirm } = req.body;

	const existingUser = await User.findOne({ email });
	if (existingUser) {
		return res.status(409).json({
			status: "fail",
			message: "This Email is Used",
		});
	}

	const newUser = await User.create({
		name,
		email,
		password,
		passwordConfirm,
	});
	const verifyToken = newUser.createVerifyToken();
	await newUser.save({ validateBeforeSave: false });

	res.status(201).json({
		status: "success",
		token: newUser.verifyToken,
	});
};

// Login
exports.login = async (req, res, next) => {
	const { error } = loginSchema.validate(req.body);
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}

	const { email, password } = req.body;

	const user = await User.findOne({ email }).select("+password");
	if (!user || !(await user.correctPassword(password))) {
		return next(new AppError("Incorrect email or password.", 401));
	}

	const token = user.createVerifyToken();
	user.verifyTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 روز
	await user.save({ validateBeforeSave: false });

	res.status(200).json({
		message: "Login successful",
		token: user.verifyToken,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			photo: user.photo,
		},
	});
};

// Password Reset
exports.PasswordReset = async (req, res, next) => {
	const { error } = passwordResetSchema.validate(req.body);
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}

	const { email, currentPassword, newPassword, newPasswordConfirm } = req.body;
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		return next(new AppError("Please provide the token.", 400));
	}

	const user = await User.findOne({ email }).select(
		"+password verifyToken verifyTokenExpires",
	);
	if (!user) {
		return next(new AppError("No user found with this email.", 404));
	}

	if (token !== user.verifyToken || Date.now() > user.verifyTokenExpires) {
		return next(new AppError("Token is invalid or has expired.", 400));
	}

	if (!(await user.correctPassword(currentPassword))) {
		return next(new AppError("Current password is incorrect.", 401));
	}

	user.password = newPassword;
	user.passwordConfirm = newPasswordConfirm;
	user.createVerifyToken();
	user.verifyTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;
	await user.save();

	res.status(200).json({
		status: "success",
		message: "Password has been reset successfully.",
		token: user.verifyToken,
	});
};

// Forget Password
exports.forgetPassword = async (req, res, next) => {
	const { error } = forgetPasswordSchema.validate(req.body);
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}
	const { email } = req.body;

	if (!email) {
		return next(new AppError("Please provide your email.", 400));
	}

	const user = await User.findOne({ email }).select("+password");

	if (!user) {
		return next(new AppError("There is no user with this email address.", 404));
	}

	const newPassword = crypto.randomBytes(20).toString("hex");
	user.password = newPassword;
	user.passwordConfirm = newPassword;
	await user.save({ validateBeforeSave: false });

	const message = `Your new password is: ${newPassword}\nPlease change it after logging in.`;

	try {
		await sendEmail(email, "Your new password", message);
		res.status(200).json({
			status: "success",
			message: "New password sent to email!",
		});
	} catch (err) {
		return next(
			new AppError(
				"There was an error sending the email. Try again later!",
				500,
			),
		);
	}
};

// Delete Me
exports.deleteAccount = async (req, res, next) => {
	const verifyToken = req.headers.authorization?.split(" ")[1];
	if (!verifyToken) {
		return next(new AppError("Please provide a valid token.", 400));
	}
	const user = await User.findOne({ verifyToken }).select(
		"verifyToken verifyTokenExpires",
	);

	if (
		!user ||
		verifyToken !== user.verifyToken ||
		Date.now() > user.verifyTokenExpireschangedPasswordAfter
	) {
		return next(new AppError("Token is invalid or has expired.", 400));
	}
	await User.findByIdAndDelete(user._id);
	res.status(202).json({
		status: "success",
		message: "Account deleted successfully.",
	});
};
