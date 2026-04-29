const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Lütfen 1 ile 5 arasında puan verin.",
      });
    }

    const review = await prisma.appReview.create({
      data: {
        userId,
        rating,
        comment: comment || null,
      },
    });

    return res.status(201).json({
      message: "Değerlendirme başarıyla kaydedildi.",
      review,
    });
  } catch (error) {
    console.log("CREATE REVIEW ERROR:", error);
    return res.status(500).json({
      message: "Değerlendirme kaydedilemedi.",
    });
  }
};