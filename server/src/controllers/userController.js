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
        createdAt: true,
        organizations: {
          select: {
            role: true,
            organization:{
              select: {
                id:true,
                name: true
              }
            }
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    const formattedUser = {
      ...user,
      myOrganizations: user.organizations.map(item => ({
        id: item.organization.id,
        name: item.organization.name,
        role: item.role
      }))
    };

    res.json(formattedUser);
    
  } catch (error) {
    console.error("GetMe Hatası:", error);
    res.status(500).json({ error: "Kullanıcı bilgileri alınırken hata oluştu." });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { name } = req.body;

    // 1. Validasyon: İsim boş gönderilmemeli
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "İsim en az 2 karakter olmalıdır." });
    }

    // 2. Güncelleme işlemi
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim() 
      },
      // Frontend'e lazım olacak alanları seçiyoruz
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true
      }
    });

    // 3. Yanıt: Frontend bu 'user' objesini direkt localStorage'a yazabilir
    res.json({ 
      message: "Profiliniz başarıyla güncellendi.", 
      user: updatedUser 
    });

  } catch (error) {
    console.error("UpdateProfile Hatası:", error);
    
    // P2025: Prisma "Kaydı bulamadım" hatası
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    
    res.status(500).json({ error: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." });
  }
};
