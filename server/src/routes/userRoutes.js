const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.get("/verify-email/:token", userController.verifyEmail);

router.use(authenticateToken);

// 👤 PROFİL

router.get("/me", userController.getMe);
router.get("/:userId/tasks", userController.getUserTasks);
router.put("/profile", userController.updateProfile);

// 🔐 ŞİFRE DEĞİŞTİR
router.put("/change-password", userController.changePassword);

// 📧 E-POSTA DOĞRULAMA
router.post("/send-verification", userController.sendEmailVerification);
router.post("/logout", userController.logout);

// 📱 OTURUMLAR
router.get("/sessions", userController.getSessions);
router.delete("/sessions/:id", userController.deleteSession);
router.delete("/sessions", userController.deleteOtherSessions);

// ❌ HESAP SİL
router.delete("/delete-account", userController.deleteAccount);

// 📸 FOTOĞRAF
router.post(
  "/profile-image",
  upload.single("image"),
  userController.uploadProfileImage
);

router.delete(
  "/profile-image",
  userController.deleteProfileImage
);

// ⚠️ TEK EXPORT OLACAK
module.exports = router;