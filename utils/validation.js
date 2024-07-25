const Joi = require("joi");

const imageExtensionRegex = /\.(jpeg|jpg)$/;

const signupSchema = Joi.object({
	name: Joi.string().min(3).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(8).required(),
	passwordConfirm: Joi.string().valid(Joi.ref("password")).required(),
});

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(8).required(),
});

const passwordResetSchema = Joi.object({
	email: Joi.string().email().required(),
	currentPassword: Joi.string().min(8).required(),
	newPassword: Joi.string().min(8).required(),
	newPasswordConfirm: Joi.string().valid(Joi.ref("newPassword")).required(),
});

const forgetPasswordSchema = Joi.object({
	email: Joi.string().email().required(),
});

const commentSchema = Joi.object({
	title: Joi.string().min(7).required(),
	body: Joi.string().min(10).required(),
});

const feedbackSchema = Joi.object({
	title: Joi.string().min(7).required(),
	body: Joi.string().min(10).required(),
	images: Joi.array().items(Joi.string().regex(imageExtensionRegex)),
});

module.exports = {
	signupSchema,
	loginSchema,
	passwordResetSchema,
	forgetPasswordSchema,
	commentSchema,
	feedbackSchema,
};
