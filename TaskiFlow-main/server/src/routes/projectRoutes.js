
const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);


router.get("/", projectController.getProjects); 
router.post("/", projectController.createProject); 

module.exports = router;