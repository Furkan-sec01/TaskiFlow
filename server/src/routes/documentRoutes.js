const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const documentController = require("../controllers/documentController");
const authenticateToken = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ_-]/g, "_");

    const uniqueName = `${Date.now()}-${safeBaseName}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

router.use(authenticateToken);

router.get("/", documentController.getDocuments);
router.post("/upload", upload.single("file"), documentController.uploadDocument);
router.patch("/:id/project", documentController.attachToProject);
router.delete("/:id", documentController.deleteDocument);

module.exports = router;