const express = require("express");
const { AddComment } = require("../../controllers/V1/commentController");
const router = express.Router();
router.route("/:feedbackId").post(AddComment);

module.exports = router;
