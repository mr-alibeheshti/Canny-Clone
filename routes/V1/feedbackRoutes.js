const express = require("express");
const router = express.Router();
const feedbackController = require("../../controllers/V1/feedbackController");
const {
	uploadRequestImages,
	resizeRequestImages,
} = require("../../utils/multerConfig");

router.post(
	"/",
	uploadRequestImages,
	resizeRequestImages,
	feedbackController.newFeedback,
);

router.get("/", feedbackController.getAllFeedback);
router.get("/feedback/:id", feedbackController.getOneFeedback);

module.exports = router;
