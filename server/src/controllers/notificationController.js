const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

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
    const currentOrgId = req.user.organizationId
    

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

        let newToken = null;

        if (action === "ACCEPT") {
            const updateUser = await prisma.user.update({
                where: { id: currentUserId }, 
                data: {
                    organizationId: invitation.organizationId 
                }
            });

            newToken = jwt.sign(
                {
                    userId: updateUser.id,
                    email: updateUser.email,
                    organizationId: updateUser.organizationId
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '24h'
                }
            );

            await prisma.organization.delete({
                where: {id: currentOrgId}
            });
        }

        await prisma.notification.delete({
            where: { id: notificationId }
        });

        return res.json({
            message: action === "ACCEPT" ? "Başarıyla ekibe katıldınız!" : "Davet reddedildi.",
            token: newToken
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