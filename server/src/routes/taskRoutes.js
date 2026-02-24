const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);
router.post("/create/:projectId/:columnId", taskController.createTask); 
router.delete("/delete/:taskId", taskController.deleteTask); 

module.exports = router;