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
    const {title, description} = req.body;
    const {userId} = req.user;

    if(!title){
        return res.status(400).json({
            error: "Proje Başlığı Zorunludur."
        });
    }

    try {
        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                ownerId: userId,
                columns: {
                    create: [
                        {title: "Yapılacalar", order: 1},
                        {title: "Devam Ediyor", order: 2},
                        {title: "Bitti", order: 3}
                    ]
                }
            },
            include: {
                columns: true
            }
        });

        res.status(201).json(newProject);
    }catch(error){
        console.log("Proje Oluşturma Hatası: ",error);
        res.status(500).json({ error: "Proje oluşturulurken bir hata oluştu." })
    }
}