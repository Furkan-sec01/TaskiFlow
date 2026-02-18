const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();


exports.inviteMember = async (req, res) => {
    const {email} = req.body;
    const {organizationId} = req.user;
    const inviterOrgId = req.user.organizationId;
    const inviterName = req.user.name;
    

    try{

        let existingUser = await prisma.user.findUnique({where: {email}});
        
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