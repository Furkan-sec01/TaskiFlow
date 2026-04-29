const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.use(authenticateToken);

// GET /api/users/me
router.get("/me", userController.getMe);
router.put("/profile", userController.updateProfile);

router.post(
  "/profile-image",
  upload.single("image"),
  userController.uploadProfileImage
);

router.delete(
  "/profile-image",
  userController.deleteProfileImage
);

module.exports = router;
module.exports = router;