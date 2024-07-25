const Comment = require("../../models/CommentModel");
const User = require("../../models/UserModel");
const AppError = require("../../utils/AppError");
const Feedback = require("../../models/FeedbackModel");
const { commentSchema } = require("../../utils/validation");

exports.AddComment = async (req, res, next) => {
	const verifyToken = req.headers.authorization?.split(" ")[1];
	const { feedbackId } = req.params;
	const { title, body } = req.body;

	const { error } = commentSchema.validate({ title, body });
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}

	const feedback = await Feedback.findById(feedbackId);
	if (!feedback) {
		return next(new AppError("Feedback not found", 404));
	}

	const user = await User.findOne({ verifyToken });
	if (!user) {
		return next(new AppError("User not found", 404));
	}

	await Comment.create({
		user,
		feedback,
		title,
		body,
	});

	res.status(201).json({
		status: "Success",
		message: "Your Comment Submitted",
		title,
		body,
		CommentFor: feedback.title,
	});
};
