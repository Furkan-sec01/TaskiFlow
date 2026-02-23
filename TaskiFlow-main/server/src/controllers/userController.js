const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    res.json(user);
  } catch (error) {
    console.error("GetMe Hatası:", error);
    res.status(500).json({ error: "Kullanıcı bilgileri alınırken hata oluştu." });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { name } = req.body; 

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name 
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    res.json({ message: "Profil güncellendi", user: updatedUser });
  } catch (error) {
    console.error("UpdateProfile Hatası:", error);
    res.status(500).json({ error: "Profil güncellenirken bir hata oluştu." });
  }
};