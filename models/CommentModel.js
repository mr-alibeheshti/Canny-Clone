const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: [true, "please Login In Your account"],
		},
		feedback: {
			type: mongoose.Schema.ObjectId,
			ref: "Feedback",
		},
		title: {
			type: String,
		},
		body: {
			type: String,
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);
commentSchema.index({ feedback: 1, user: 1 }, { unique: true });
commentSchema.pre(/^find/, function (next) {
	this.populate({
		path: "user",
		select: "name photo",
	});
	next();
});
const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
