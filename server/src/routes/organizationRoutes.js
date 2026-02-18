const express = require("express");
const router = express.Router();
const orgController = require("../controllers/organizationController")
const authenticateToken = require("../middleware/authMiddleware");


router.use(authenticateToken);

router.get("/members",orgController.getMembers);
router.post("/invite",orgController.inviteMember);
router.post("/leave",orgController.leaveOrganization);

module.exports = router;