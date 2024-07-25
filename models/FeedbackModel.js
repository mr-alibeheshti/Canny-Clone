const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Feedback must have a title"],
		},
		status: {
			type: String,
			default: "pending",
		},
		category: {
			type: String,
		},
		body: {
			type: String,
			required: [true, "Feedback must have a body"],
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: [true, "Feedback must be associated with a user"],
		},
		images: [
			{
				type: String,
				default: "",
			},
		],
		createdAt: {
			type: Date,
			default: Date.now,
		},
		votes: {
			type: Number,
			default: 0,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

feedbackSchema.index({ title: 1, user: 1 }, { unique: true });
feedbackSchema.virtual("comments", {
	ref: "Comment",
	foreignField: "feedback",
	localField: "_id",
});
feedbackSchema.pre(/^find/, function (next) {
	this.populate({
		path: "user",
		select: "name photo",
	});
	next();
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
