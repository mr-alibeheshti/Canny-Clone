const User = require("../../models/UserModel");
const Vote = require("../../models/VoteModel");
const Feedback = require("../../models/FeedbackModel");
const AppError = require("../../utils/AppError");

exports.AddVote = async (req, res, next) => {
	const verifyToken = req.headers.authorization?.split(" ")[1];
	const { feedbackId } = req.params;

	const user = await User.findOne({ verifyToken });
	if (!user) {
		return next(new AppError("User not found", 404));
	}

	const feedback = await Feedback.findById(feedbackId);
	if (!feedback) {
		return next(new AppError("Feedback not found", 404));
	}

	const existingVote = await Vote.findOne({
		user: user._id,
		feedback: feedback._id,
	});
	if (existingVote) {
		return next(new AppError("You have already voted for this feedback", 400));
	}

	const vote = await Vote.create({
		user: user._id,
		feedback: feedback._id,
	});
	res.status(201).json({
		status: "success",
		data: {
			vote,
		},
	});
};
