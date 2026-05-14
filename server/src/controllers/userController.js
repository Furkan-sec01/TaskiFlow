const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        username: true,
        notificationEnabled: true,
        phone: true,
        bio: true,
        department: true,
        profileRole: true,
        location: true,
        profileImage: true,
        status: true,
        createdAt: true,
        organizations: {
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    const projectCount = await prisma.project.count({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId },
            },
          },
        ],
      },
    });

    const taskCount = await prisma.task.count({
      where: {
        OR: [{ ownerId: userId }, { assigneeId: userId }],
      },
    });

    const completedTaskCount = await prisma.task.count({
      where: {
        isCompleted: true,
        OR: [{ ownerId: userId }, { assigneeId: userId }],
      },
    });

    const formattedUser = {
      ...user,
      myOrganizations: (user.organizations || []).map((item) => ({
        id: item.organization.id,
        name: item.organization.name,
        role: item.role,
      })),
    };

    return res.json({
      ...formattedUser,
      stats: {
        projectCount,
        taskCount,
        completedTaskCount,
      },
    });
  } catch (error) {
    console.error("GetMe Hatası:", error);
    return res
      .status(500)
      .json({ error: "Kullanıcı bilgileri alınırken hata oluştu." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const {
      name,
      email,
      username,
      phone,
      bio,
      department,
      profileRole,
      notificationEnabled,
      location,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        username: true,
        phone: true,
        bio: true,
        department: true,
        profileRole: true,
        notificationEnabled: true,
        location: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    const finalName = name !== undefined ? name : user.name;
    const finalEmail = email !== undefined ? email : user.email;

    if (typeof finalName !== "string" || finalName.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "İsim en az 2 karakter olmalıdır." });
    }

    if (typeof finalEmail !== "string" || !finalEmail.trim()) {
      return res.status(400).json({ error: "E-posta boş olamaz." });
    }

    if (username !== undefined && typeof username !== "string") {
      return res.status(400).json({ error: "Kullanıcı adı metin olmalıdır." });
    }

    if (phone !== undefined && typeof phone !== "string") {
      return res.status(400).json({ error: "Telefon metin olmalıdır." });
    }

    if (bio !== undefined && typeof bio !== "string") {
      return res.status(400).json({ error: "Biyografi metin olmalıdır." });
    }

    if (department !== undefined && typeof department !== "string") {
      return res.status(400).json({ error: "Departman metin olmalıdır." });
    }

    if (profileRole !== undefined && typeof profileRole !== "string") {
      return res.status(400).json({ error: "Rol metin olmalıdır." });
    }

    if (location !== undefined && typeof location !== "string") {
      return res.status(400).json({ error: "Konum metin olmalıdır." });
    }

    if (
      notificationEnabled !== undefined &&
      typeof notificationEnabled !== "boolean"
    ) {
      return res
        .status(400)
        .json({ error: "Bildirim ayarı boolean olmalıdır." });
    }

    const trimmedName = finalName.trim();
    const trimmedEmail = finalEmail.trim().toLowerCase();
    const trimmedUsername =
      typeof username === "string" ? username.trim() : user.username || "";
    const trimmedPhone =
      typeof phone === "string" ? phone.trim() : user.phone || "";
    const trimmedBio = typeof bio === "string" ? bio.trim() : user.bio || "";
    const trimmedDepartment =
      typeof department === "string" ? department.trim() : user.department || "";
    const trimmedProfileRole =
      typeof profileRole === "string"
        ? profileRole.trim()
        : user.profileRole || "";
    const trimmedLocation =
      typeof location === "string" ? location.trim() : user.location || "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: "Geçerli bir e-posta giriniz." });
    }

    if (trimmedUsername && trimmedUsername.length < 3) {
      return res
        .status(400)
        .json({ error: "Kullanıcı adı en az 3 karakter olmalıdır." });
    }

    const existingEmailUser = await prisma.user.findFirst({
      where: {
        email: trimmedEmail,
        NOT: { id: userId },
      },
    });

    if (existingEmailUser) {
      return res.status(400).json({
        error: "Bu e-posta başka bir kullanıcı tarafından kullanılıyor.",
      });
    }

    if (trimmedUsername) {
      const existingUsernameUser = await prisma.user.findFirst({
        where: {
          username: trimmedUsername,
          NOT: { id: userId },
        },
      });

      if (existingUsernameUser) {
        return res.status(400).json({
          error: "Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor.",
        });
      }
    }

    const emailChanged = trimmedEmail !== user.email;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: trimmedName,
        email: trimmedEmail,
        emailVerified: emailChanged ? false : undefined,
        username: trimmedUsername || null,
        phone: trimmedPhone || null,
        bio: trimmedBio || null,
        department: trimmedDepartment || null,
        profileRole: trimmedProfileRole || null,
        location: trimmedLocation || null,
        notificationEnabled:
          notificationEnabled !== undefined
            ? notificationEnabled
            : user.notificationEnabled,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        username: true,
        phone: true,
        bio: true,
        department: true,
        profileRole: true,
        location: true,
        notificationEnabled: true,
        profileImage: true,
        status: true,
        createdAt: true,
      },
    });

    return res.json({
      message: "Profiliniz başarıyla güncellendi.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UpdateProfile Hatası:", error);

    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    if (error?.code === "P2002") {
      return res.status(400).json({
        error: "Bu bilgiler başka bir kullanıcı tarafından kullanılıyor.",
      });
    }

    return res
      .status(500)
      .json({ error: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }

    const currentPasswordTrimmed = currentPassword.trim();
    const newPasswordTrimmed = newPassword.trim();
    const confirmPasswordTrimmed = confirmPassword.trim();

    if (
      !currentPasswordTrimmed ||
      !newPasswordTrimmed ||
      !confirmPasswordTrimmed
    ) {
      return res.status(400).json({ error: "Tüm alanlar doldurulmalıdır." });
    }

    if (newPasswordTrimmed.length < 6) {
      return res
        .status(400)
        .json({ error: "Yeni şifre en az 6 karakter olmalıdır." });
    }

    if (newPasswordTrimmed !== confirmPasswordTrimmed) {
      return res.status(400).json({ error: "Yeni şifreler eşleşmiyor." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, password: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    if (!user.password) {
      return res.status(400).json({
        error: "Bu hesap için şifre bulunamadı.",
      });
    }

    const isMatch = await bcrypt.compare(currentPasswordTrimmed, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Mevcut şifre yanlış." });
    }

    const hashedPassword = await bcrypt.hash(newPasswordTrimmed, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Şifre başarıyla güncellendi." });
  } catch (error) {
    console.error("ChangePassword Hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
};

exports.sendEmailVerification = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken: token,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        verificationToken: true,
      },
    });

    const verificationUrl =
  `${process.env.BASE_URL}/api/users/verify-email/${token}`;

    await transporter.sendMail({
      from: `"TaskiFlow" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: "TaskiFlow E-posta Doğrulama",
      html: `
        <h2>TaskiFlow E-posta Doğrulama</h2>
        <p>Merhaba,</p>
        <p>E-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
        <p>
          <a href="${verificationUrl}" target="_blank">
            E-posta adresimi doğrula
          </a>
        </p>
        <p>Bağlantı çalışmazsa aşağıdaki linki tarayıcıya kopyalayabilirsiniz:</p>
        <p>${verificationUrl}</p>
        <hr/>
        <p style="color:gray;font-size:12px">
          Bu işlemi siz yapmadıysanız bu maili yok sayabilirsiniz.
        </p>
      `,
    });

    return res.json({
      message: "Doğrulama maili gönderildi.",
      email: user.email,
    });
  } catch (error) {
    console.error("SendEmailVerification Hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Doğrulama tokenı eksik." });
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ error: "Geçersiz doğrulama bağlantısı." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    return res.json({ message: "E-posta başarıyla doğrulandı." });
  } catch (error) {
    console.error("VerifyEmail Hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası." });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const currentToken = getBearerToken(req);

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const sessions = await prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActive: "desc" },
      select: {
        id: true,
        device: true,
        location: true,
        ipAddress: true,
        userAgent: true,
        token: true,
        lastActive: true,
        createdAt: true,
      },
    });

    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      device: session.device || "Bilinmeyen cihaz",
      location: session.location || "Konum bilinmiyor",
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      current: currentToken ? session.token === currentToken : false,
      lastActive: session.lastActive,
      createdAt: session.createdAt,
    }));

    return res.json(formattedSessions);
  } catch (error) {
    console.error("GetSessions Hatası:", error);
    return res.status(500).json({ error: "Oturumlar alınamadı." });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const session = await prisma.userSession.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Oturum bulunamadı." });
    }

    await prisma.userSession.delete({
      where: { id },
    });

    return res.json({ message: "Oturum sonlandırıldı." });
  } catch (error) {
    console.error("DeleteSession Hatası:", error);
    return res.status(500).json({ error: "Oturum sonlandırılamadı." });
  }
};

exports.deleteOtherSessions = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const currentToken = getBearerToken(req);

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    await prisma.userSession.deleteMany({
      where: {
        userId,
        ...(currentToken ? { token: { not: currentToken } } : {}),
      },
    });

    return res.json({
      message: "Bu cihaz dışındaki tüm oturumlar sonlandırıldı.",
    });
  } catch (error) {
    console.error("DeleteOtherSessions Hatası:", error);
    return res.status(500).json({ error: "Oturumlar sonlandırılamadı." });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        profileImage: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    if (user.password) {
      if (typeof password !== "string" || !password.trim()) {
        return res.status(400).json({
          error: "Hesabı silmek için şifrenizi girmeniz gerekir.",
        });
      }

      const isMatch = await bcrypt.compare(password.trim(), user.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Şifre yanlış." });
      }
    }

    const ownedProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    const ownedProjectIds = ownedProjects.map((project) => project.id);

    await prisma.userSession.deleteMany({
      where: { userId },
    });

    if (prisma.notification?.deleteMany) {
      await prisma.notification.deleteMany({
        where: { userId },
      });
    }

    if (prisma.review?.deleteMany) {
      await prisma.review.deleteMany({
        where: { userId },
      });
    }

    if (prisma.payment?.deleteMany) {
      await prisma.payment.deleteMany({
        where: { userId },
      });
    }

    if (prisma.user_Project?.deleteMany) {
      await prisma.user_Project.deleteMany({
        where: {
          OR: [
            { userId },
            ...(ownedProjectIds.length > 0
              ? [{ projectId: { in: ownedProjectIds } }]
              : []),
          ],
        },
      });
    }

    if (prisma.user_Organization?.deleteMany) {
      await prisma.user_Organization.deleteMany({
        where: { userId },
      });
    }

    await prisma.task.deleteMany({
      where: {
        OR: [
          { ownerId: userId },
          { assigneeId: userId },
          ...(ownedProjectIds.length > 0
            ? [{ projectId: { in: ownedProjectIds } }]
            : []),
        ],
      },
    });

    if (ownedProjectIds.length > 0) {
      await prisma.column.deleteMany({
        where: {
          projectId: { in: ownedProjectIds },
        },
      });

      await prisma.project.deleteMany({
        where: {
          id: { in: ownedProjectIds },
        },
      });
    }

    if (user.profileImage) {
      const filePath = path.join(__dirname, "..", "..", user.profileImage);

      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.log("Profil fotoğrafı silinemedi:", err);
        });
      }
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return res.json({ message: "Hesabınız başarıyla silindi." });
  } catch (error) {
    console.error("DeleteAccount Hatası:", error);
    return res.status(500).json({ error: "Hesap silinemedi." });
  }
};
// 📸 FOTO YÜKLE
exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!req.file) {
      return res.status(400).json({ message: "Dosya yok" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
    });

    res.json({
      message: "Fotoğraf yüklendi",
      profileImage: imageUrl,
    });
  } catch (err) {
    console.log("Upload error:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// 🗑️ FOTO SİL
exports.deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true },
    });

    if (user?.profileImage) {
      const filePath = path.join(__dirname, "..", "..", user.profileImage);

      fs.unlink(filePath, (err) => {
        if (err) console.log("Dosya silinemedi:", err);
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: null },
    });

    res.json({ message: "Fotoğraf tamamen silindi" });
  } catch (err) {
    console.log("Delete error:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
exports.logout = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const currentToken = getBearerToken(req);

    if (!userId || !currentToken) {
      return res.status(401).json({
        error: "Yetkisiz erişim.",
      });
    }

    await prisma.userSession.deleteMany({
      where: {
        userId,
        token: currentToken,
      },
    });

    return res.json({
      message: "Çıkış yapıldı.",
    });
  } catch (error) {
    console.error("Logout Hatası:", error);

    return res.status(500).json({
      error: "Çıkış yapılamadı.",
    });
  }
};
exports.getUserTasks = async (req, res) => {
  const { userId } = req.params;

  try {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { title: true } },
        assignee: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (error) {
    console.error("getUserTasks Hatası:", error);
    res.status(500).json({ error: "Görevler alınamadı." });
  }
};