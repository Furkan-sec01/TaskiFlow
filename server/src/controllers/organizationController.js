const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();


exports.inviteMember = async (req, res) => {
    const {email} = req.body;
    const inviterOrgId = req.user.organizationId;
    const inviterName = req.user.name;
    const currentUserId = req.user.userId || req.user.id;
    

    try{
        const organization = await prisma.organization.findUnique({
            where: {id: inviterOrgId}
        });

        if(!organization){
            return res.status(400).json({
                error: "Organizasyon Bulunamadı."
            });
        }


        if(currentUserId !== organization.ownerId){
            return res.status(403).json({
                error: "Sadece ekip yöneticisi üye ekleyebilir."
            });
        }

        const existingUser = await prisma.user.findUnique({where: {email}});
        
        if(!existingUser){
            return res.status(400).json({
                error: "Kullanıcı Bulunamadı. Önce kayıt olmasını isteyin."
            });
        }

        if(existingUser.organizationId === inviterOrgId){
            return res.status(400).json({
                error: "Kullanıcı zaten ekibinizde."
            });
        }

        await prisma.notification.create({
            data:{
                userId: existingUser.id,
                organizationId: inviterOrgId,
                title: "Ekip Daveti",
                message: `${inviterName} sizi kendi ekibine davet ediyor.`,
                type:"ORG_INVITE",
                isRead: false
            }
        });

        res.status(200).json({
            message: "Davet bildirimi gönderildi."
        });

    } catch(error){
        console.log("Davet Hatası: ",error);
        res.status(500).json({
            error: error.message
        });
    }
}

exports.leaveOrganization = async (req, res) => {
    const currentUserId = req.user.userId || req.user.id;
    const orgId = req.user.organizationId;

    try{

       const user = await prisma.user.findUnique({
            where: { id: currentUserId },
            include: { organization: true }
        });

        if (!user || !user.organizationId) {
            return res.status(400).json({ error: "Zaten bir ekibe bağlı değilsiniz." });
        }

        if (user.organization.ownerId === currentUserId) {
            return res.status(400).json({
                error: "Ekip sahibi ayrılamaz. Önce ekibi silin veya devredin."
            });
        }

        const newOrg = await prisma.organization.create({
            data: {
                name: `${user.name || 'User'}'s Workspace`,
                ownerId: currentUserId
            }
        });

        await prisma.user.update({
            where: { id: currentUserId },
            data: { organizationId: newOrg.id }
        });

        return res.status(200).json({
            message: "Ekipten ayrıldınız ve kişisel alanınız oluşturuldu.",
            newOrganizationId: newOrg.id
        });

    } catch(error){
        console.log("Hata: ", error);
        res.status(400).json({
            error: "Ekipten ayrılırken bir hata oluştu."
        });
    }
}

exports.deleteMember = async (req, res) => {
    const {memberId} = req.body;
    const currentUserId = req.user.userId || req.user.id;
    const orgId = req.user.organizationId;


    try{

        const organization = await prisma.organization.findUnique({
            where: {id: orgId}
        });

        if(!organization || organization.ownerId !== currentUserId){
                res.status(403).json({
                    error: "Bu işlem için yetkiniz yok"
                });

                return;
        }

        const member= await prisma.user.findUnique({
                where: {id: memberId}
        });

        if(!member || member.organizationId !== organization.id){
                res.status(404).json({
                    error: "Üye bu ekipte bulunamadı."
                });

                return;
        }

        if(memberId === organization.ownerId){
                res.status(403).json({
                    error: "Lider kendi kendini çıkaramaz."
                });

                return;
        }

        const newOrg = await prisma.organization.create({
                data: {
                    name: `${member.name || 'User'}'s Workspace`,
                    ownerId: memberId
                }
        });

        await prisma.user.update({
                where: {id: memberId},
                data: {organizationId: newOrg.id}
        });


            return res.json({
                message: "Üye Başarıyla ekipten çıkarıldı",
            });

    }catch(error){
        console.log("Hata: ", error);
        res.status(500).json({
            error: "Üye silme işleminde hata oluştu"
        });
    }
   
}

exports.getMembers = async (req, res) => {
    
    try{
        const currentUserId = req.user.userId || req.user.id;

        const user = await prisma.user.findUnique({
            where: {id: currentUserId},
            select: {organizationId: true}
        });

        if(!user || !user.organizationId){
            return res.json([]);
        }

        const members = await prisma.user.findMany({
            where:{organizationId: user.organizationId},
            select:{
                id:true,
                name:true,
                email:true,
                status:true
            }
        });
        res.json(members);
    } catch(error){
        res.status(500).json({
            error: error.message
        });
    }
}