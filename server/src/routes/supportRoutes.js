const express = require("express");
const router = express.Router();

const supportController = require("../controllers/supportController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.post("/", supportController.createSupportTicket);

module.exports = router;