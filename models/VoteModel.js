const mongoose = require("mongoose");
const Feedback = require("./FeedbackModel");

const VoteSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		required: [true, "Vote must be associated with a user"],
	},
	feedback: {
		type: mongoose.Schema.ObjectId,
		ref: "Feedback",
		required: [true, "Vote must be associated with a feedback"],
	},
});

VoteSchema.statics.calcNum = async function (feedbackId) {
	try {
		const stats = await this.aggregate([
			{
				$match: { feedback: feedbackId },
			},
			{
				$group: {
					_id: "$feedback",
					sum: { $sum: 1 },
				},
			},
		]);

		if (stats.length > 0) {
			const votes = stats[0].sum;
			await Feedback.findByIdAndUpdate(feedbackId, { votes });
		} else {
			await Feedback.findByIdAndUpdate(feedbackId, { votes: 0 });
		}

		const updatedFeedback = await Feedback.findById(feedbackId);
	} catch (error) {}
};

VoteSchema.index({ user: 1, feedback: 1 });

VoteSchema.post("save", async function () {
	await this.constructor.calcNum(this.feedback);
});

VoteSchema.pre(/^findOneAnd/, async function (next) {
	this.r = await this.clone().findOne();
	next();
});

VoteSchema.post(/^findOneAnd/, async function () {
	if (this.r) {
		await this.r.constructor.calcNum(this.r.feedback);
	}
});

const Vote = mongoose.model("Vote", VoteSchema);
module.exports = Vote;
