const express = require("express");
const router = express.Router();
const colController = require("../controllers/columnController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.post("/create/:projectId", colController.createColumn);
router.delete("/delete/:projectId/:columnId", colController.deleteColumn);
router.patch("/task/:taskId/move", colController.moveTask);
module.exports = router;