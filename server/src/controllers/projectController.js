const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

//projeleri getir
exports.getProjects = async (req, res) => {
    const {userId} = req.user;

    try{
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    {ownerId: userId},
                    {members: {some: {userId: userId}}}
                ]
            },
            include: {
                _count: {
                    select: {columns: true}
                }
            },
            orderBy: {createdAt: 'desc'}
        });
        res.json(projects);
    } catch(error){
        console.error("Proje Listeleme Hatası:", error.message);
        res.status(500).json({ error: "Projeler yüklenemedi." });
    }
}

//yeni proje
exports.createProject = async (req, res) => {
    const {title, description, organizationId} = req.body;
    const userId = req.user.id || req.user.userId;

    if(!title || !description){
        res.status(400).json({
            error: "Başlık ve Açıklama doldurulmalı."
        });
    }

    try{
        const membership = await prisma.user_Organization.findUnique({
            where: {
                userId_organizationId:{
                    userId,
                    organizationId
                }
            }
        });

        if(!membership || membership.role === "MEMBER"){
            return res.status(403).json({ error: "Bu organizasyonda proje oluşturma yetkiniz yok." });
        }

        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                orgId: organizationId,
                ownerId: userId
            }
        });

        res.status(201).json(newProject);
    }catch(error){
        res.status(500).json({ error: "Proje oluşturulurken bir hata oluştu." });
    }

}

exports.getProjectByOrg = async (req, res) => {
    const {orgId} = req.params;
    const userId = req.user.id || req.user.userId;

    try{
        const membership = await prisma.user_Organization.findUnique({
            where:{
                userId_organizationId:{
                    userId: userId,
                    organizationId: orgId
                }
            }
        });

        if(!membership){
            return res.status(403).json({ error: "Bu organizasyonun projelerine erişim yetkiniz yok." });
        }


        const projects = await prisma.project.findMany({
            where: {
                orgId: orgId
            },
            include:{
                _count:{
                    select:{
                        tasks:true,
                        columns: true
                    }
                }
            },
            orderBy:{
                createdAt: 'desc'
            }
        });

        res.json(projects);
    }catch(error){
        console.error("getProjectByOrg Hatası:", error);
        res.status(500).json({ error: "Projeler yüklenirken bir hata oluştu." });
    }
}