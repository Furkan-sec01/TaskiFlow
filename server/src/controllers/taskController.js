const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();


exports.createTask = async (req, res) => {
    const userId = req.user.id || req.user.userId;
    const {title,assigneeMail,priority,date,description} = req.body;
    const {projectId,columnId} = req.params;
    
    if(!title ||!assigneeMail || !priority || !date || !description){
        res.status(400).json({
            error: "Gerekli alanları doldurmalısınız."
        });

        return;
    }

    try{
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if(!user){
            res.status(404).json({
                error: "Kullanıcı bulunamadı."
            });

            return;
        }

        const assignee = await prisma.user.findUnique({
            where: {
                email: assigneeMail
            }
        });

        if(!assignee){
            res.status(404).json({
                error: "Görevi yapcak üye bulunamadı."
            });

            return;
        }

        await prisma.task.create({
            data: {
                title: title,
                assigneeId: assignee.id,
                priority: priority,
                dueDate: new Date(date),
                description: description,
                columnId: columnId,
                projectId: projectId
            }
        });

        await prisma.notification.create({
            data: {
                title: "Yeni Görev",
                message: `${user.name} size yeni bir görev verdi`,
                userId: assignee.id,
                type: "TASK",
                
            }
        })

        res.status(200).json({
            message: "Görev verildi."
        });
    }catch(error){
        res.status(500).json({
            error: "Server Hatası"
        });
        console.log("createTask hatası.");
    }

}

exports.deleteTask = async (req, res) => {
    const {taskId} = req.params;
    const userId = req.user.id || req.user.userId;


    try{
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    select: { ownerId: true }
                }
            }
        });

        if(!task){
            res.status(404).json({
                error: "Görev bulunamadı."
            });

            return;
        }

        if(userId !== task.project.ownerId){
            return res.status(403).json({ error: "Bu görevi silme yetkiniz yok." });
        }

        

        await prisma.task.delete({
            where: {
                id: taskId
            }
        });

        res.status(200).json({
            message: "Görev silindi."
        });


    }catch(error){
        console.log("deleteTask hatası: ",error);
        res.status(500).json({ error: "Görev silinirken bir sunucu hatası oluştu." });
    }
}