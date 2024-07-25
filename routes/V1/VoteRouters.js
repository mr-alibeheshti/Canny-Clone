const express = require("express");
const router = express.Router();
const { AddVote } = require("../../controllers/V1/VoteController");

router.route("/:feedbackId").post(AddVote);

module.exports = router;
