const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.post("/", reviewController.createReview);

module.exports = router;