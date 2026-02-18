const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

exports.getMyNotifications = async (req, res) =>{
    try{

        const notifications = await prisma.notification.findMany({
            where: {
                userId: req.user.id || req.user.userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(notifications);

    } catch(error){
        console.log("Bildirim Hatası: ",error)
        res.status(500).json({
            error: error.message
        });
    }
}

exports.respondToInvıte = async (req, res) => {
    const { notificationId, action } = req.body;
    const currentUserId = req.user.id || req.user.userId;

    if (!currentUserId) {
        return res.status(401).json({ error: "Kullanıcı kimliği bulunamadı." });
    }

    try {
        
        const invitation = await prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!invitation) {
            return res.status(404).json({ message: "Davet kaydı bulunamadı." });
        }

        if (action === "ACCEPT") {
            await prisma.user.update({
                where: { id: currentUserId }, 
                data: {
                    organizationId: invitation.organizationId 
                }
            });
        }

        await prisma.notification.delete({
            where: { id: notificationId }
        });

        return res.json({
            message: action === "ACCEPT" ? "Başarıyla ekibe katıldınız!" : "Davet reddedildi."
        });

    } catch (error) {
        console.error("Hata Detayı:", error);
        res.status(500).json({ error: "Sunucu hatası oluştu." });
    }
};

exports.markAsRead = async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json({ message: "Okundu işaretlendi." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};