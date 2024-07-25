const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please provide your name"],
	},
	email: {
		type: String,
		unique: true,
		lowercase: true,
		required: [true, "Please provide your email"],
	},
	password: {
		type: String,
		required: [true, "Please provide a password"],
		minlength: 8,
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, "Please confirm your password"],
	},
	changedPasswordAt: Date,
	role: {
		type: String,
		default: "user",
	},
	isActive: {
		type: Boolean,
		default: true,
		select: false,
	},
	photo: {
		type: String,
		default: "./utils/user.png",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	verifyToken: String,
	verifyTokenExpires: Date,
});

userSchema.methods.createVerifyToken = function () {
	const token = crypto.randomBytes(6).toString("hex");
	this.verifyToken = crypto.createHash("sha256").update(token).digest("hex");
	this.verifyTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;
	return token;
};

userSchema.methods.changedPasswordAfter = function (jwtiat) {
	if (this.changedPasswordAt) {
		const passwordChanged = Math.floor(this.changedPasswordAt.getTime() / 1000);
		return passwordChanged > jwtiat;
	}
	return false;
};

userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 12);
		this.passwordConfirm = undefined;
	}
	if (this.isModified("password") || this.isNew) {
		this.changedPasswordAt = Date.now();
	}
	next();
});

userSchema.pre(/^find/, function (next) {
	this.find({ isActive: true });
	next();
});

userSchema.methods.correctPassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
