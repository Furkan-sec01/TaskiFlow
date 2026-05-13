const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

const mapDocumentsWithProjectNames = async (documents) => {
  const projectIds = [
    ...new Set(documents.map((d) => d.projectId).filter(Boolean)),
  ];

  if (projectIds.length === 0) {
    return documents.map((doc) => ({
      ...doc,
      projectTitle: null,
    }));
  }

  const projects = await prisma.project.findMany({
    where: {
      id: {
        in: projectIds,
      },
    },
    select: {
      id: true,
      title: true,
    },
  });

  const projectMap = {};
  projects.forEach((project) => {
    projectMap[project.id] = project.title;
  });

  return documents.map((doc) => ({
    ...doc,
    projectTitle: doc.projectId ? projectMap[doc.projectId] || null : null,
  }));
};

exports.getDocuments = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { projectId } = req.query;

  try {
    const where = projectId 
      ? { userId, projectId } 
      : { userId };

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const result = await mapDocumentsWithProjectNames(documents);
    res.json(result);
  } catch (error) {
    console.log("Get Documents Hatası:", error);
    res.status(500).json({ error: "Belgeler getirilemedi" });
  }
};
exports.uploadDocument = async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Dosya bulunamadı" });
    }

    const file = req.file;
    const { projectId } = req.body;

    let finalProjectId = null;

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                },
              },
            },
          ],
        },
      });

      if (!project) {
        return res.status(404).json({ error: "Proje bulunamadı veya yetkin yok" });
      }

      finalProjectId = projectId;
    }

    const newDoc = await prisma.document.create({
      data: {
        title: file.originalname,
        originalName: file.originalname,
        type: file.mimetype,
        mimeType: file.mimetype,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        fileUrl: `/uploads/${file.filename}`,
        filePath: file.path,
        projectId: finalProjectId,
        userId,
      },
    });

    res.status(201).json(newDoc);
  } catch (error) {
    console.log("Upload Document Hatası:", error);
    res.status(500).json({ error: "Dosya yüklenemedi" });
  }
};

exports.attachToProject = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { id } = req.params;
  const { projectId } = req.body;

  try {
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!document) {
      return res.status(404).json({ error: "Belge bulunamadı" });
    }

    if (!projectId) {
      const updated = await prisma.document.update({
        where: { id },
        data: { projectId: null },
      });

      return res.json({
        ...updated,
        projectTitle: null,
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Proje bulunamadı veya yetkin yok" });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: { projectId },
    });

    res.json({
      ...updated,
      projectTitle: project.title,
    });
  } catch (error) {
    console.log("Attach Project Hatası:", error);
    res.status(500).json({ error: "Projeye bağlanamadı" });
  }
};

exports.deleteDocument = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { id } = req.params;

  try {
    const doc = await prisma.document.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!doc) {
      return res.status(404).json({ error: "Belge bulunamadı" });
    }

    if (doc.filePath && fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    await prisma.document.delete({
      where: { id },
    });

    res.json({ message: "Belge silindi" });
  } catch (error) {
    console.log("Delete Document Hatası:", error);
    res.status(500).json({ error: "Belge silinemedi" });
  }
};