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

        return;
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

        const newProject = await prisma.$transaction(async (tx) => {
            const project =await tx.project.create({
                data: {
                    title: title,
                    description: description,
                    orgId: organizationId,
                    ownerId: userId
                }
            });

            await tx.user_Project.create({
                data: {
                    userId: userId,
                    projectId: project.id
                }
            });

            return project;
        });

        res.status(201).json({
            message: "Proje başarıyla oluşturuldu.",
            project: newProject
        });


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

exports.deleteProject = async (req, res) => {
    const userId = req.user.id || req.user.userId;
    const {projectId} = req.params;

    try{
        const project = await prisma.project.findUnique({
            where:{
                id: projectId
            }
        });

        if(!project){
            res.status(404).json({
                error: "Proje Bulunmadı."
            });
            console.log("Proje bulunamadı.");
            return;
        }

        if(userId !== project.ownerId){
            res.status(403).json({
                error: "Proje silme yetkini yok."
            });

            return;
        }

        await prisma.project.delete({
            where: {
                id: projectId
            }
        });

        res.status(200).json({
            message: "Proje başarıyla silindi."
        });



    }catch(error){
        console.log("deleteProject Hatası: ",error);
    }
}


exports.getProjectBoard = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.id || req.user.userId;

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { 
                ownerId: true, 
                orgId: true 
            }
        });

        if (!project) return res.status(404).json({ error: "Proje bulunamadı." });

        
        const isProjectMember = await prisma.user_Project.findUnique({
            where: { userId_projectId: { userId, projectId } }
        });

        const isOrgMember = await prisma.user_Organization.findUnique({
            where: { userId_organizationId: { userId, organizationId: project.orgId } }
        });

        if (project.ownerId !== userId && !isProjectMember && !isOrgMember) {
            return res.status(403).json({ error: "Bu projenin panosuna erişim yetkiniz yok." });
        }

       
        const projectBoard = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                columns: {
                    orderBy: { order: 'asc' },
                    include: {
                        tasks: {
                            orderBy: { order: 'asc' },
                            include: { assignee: { select: { name: true, email: true } } }
                        }
                    }
                }
            }
        });

        res.json(projectBoard);
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası oluştu." });
    }
};

exports.updateTaskPosition = async (req, res) => {
    const { taskId } = req.params; 
    const { columnId } = req.body; 

    try {
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                columnId: columnId
            }
        });

        res.status(200).json({
            message: "Görev başarıyla taşındı.",
            task: updatedTask
        });
    } catch (error) {
        console.error("updateTaskPosition Hatası:", error);
        res.status(500).json({ error: "Görev taşınırken bir hata oluştu." });
    }
};