const feedback = require("../../models/FeedbackModel");
const User = require("../../models/UserModel");
const AppError = require("../../utils/AppError");
const { feedbackSchema } = require("../../utils/validation");

exports.newFeedback = async (req, res, next) => {
	const verifyToken = req.headers.authorization?.split(" ")[1];
	const { title, body } = req.body;

	const { error } = feedbackSchema.validate({ title, body });
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}

	const user = await User.findOne({ verifyToken });
	if (!user) {
		return next(new AppError("User not found", 400));
	}

	const existingFeedback = await feedback.findOne({ title });
	if (existingFeedback) {
		return next(new AppError("Feedback with this title already exists", 400));
	}

	const imagePaths = Array.isArray(req.body.images) ? req.body.images : [];

	const newFeedback = await feedback.create({
		title,
		body,
		images: imagePaths,
		user: user._id,
	});

	res.status(201).json({
		status: "Success",
		message: "Your Feedback Submitted :)",
		title,
		body,
		images: imagePaths,
	});
};

exports.getAllFeedback = async (req, res, next) => {
	const feedbackList = await feedback
		.find()
		.select("title votes _id")
		.populate({
			path: "comments",
			select: "title body user",
		});

	res.status(200).json({
		status: "Success",
		results: feedbackList.length,
		data: {
			feedback: feedbackList,
		},
	});
};

exports.getOneFeedback = async (req, res, next) => {
	const { id } = req.params;
	const singleFeedback = await feedback
		.findById(id)
		.select("title body images votes")
		.populate({
			path: "comments",
			select: "title body user",
		});

	if (!singleFeedback) {
		return next(new AppError("Feedback not found", 404));
	}

	res.status(200).json({
		status: "Success",
		data: {
			feedback: singleFeedback,
		},
	});
};
