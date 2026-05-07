const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

const getDeviceInfo = (req) => {
  const userAgent = req.headers["user-agent"] || "Bilinmeyen cihaz";
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    req.ip ||
    "Bilinmeyen IP";

  const frontendDeviceName = req.body?.deviceName;

  let device = frontendDeviceName || "Bilinmeyen cihaz";

  if (!frontendDeviceName) {
    if (userAgent.includes("Android")) device = "Android · Mobil";
    else if (userAgent.includes("iPhone")) device = "iPhone · Safari";
    else if (userAgent.includes("Windows")) device = "Windows · Tarayıcı";
    else if (userAgent.includes("Macintosh")) device = "MacBook · Tarayıcı";
    else if (userAgent.includes("Linux")) device = "Linux · Tarayıcı";
  }

  return {
    device,
    location: "Konum bilinmiyor",
    ipAddress,
    userAgent,
  };
};

const saveOrUpdateSession = async ({ userId, token, deviceInfo }) => {
  await prisma.userSession.deleteMany({
    where: {
      userId,
      device: deviceInfo.device,
    },
  });

  await prisma.userSession.create({
    data: {
      userId,
      token,
      device: deviceInfo.device,
      location: deviceInfo.location,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      isCurrent: true,
      lastActive: new Date(),
    },
  });
};

// kayıt ol
exports.register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return res.status(400).json({
        error: "Mail adresi kullanımda.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          status: "active",
          emailVerified: false,
        },
      });

      const newOrg = await tx.organization.create({
        data: {
          name: `${name}'s Workspace`,
          ownerId: newUser.id,
        },
      });

      await tx.user_Organization.create({
        data: {
          userId: newUser.id,
          organizationId: newOrg.id,
          role: "OWNER",
        },
      });

      return {
        user: newUser,
        organization: newOrg,
      };
    });

    const token = jwt.sign(
      {
        userId: result.user.id,
        email: result.user.email,
        organizationId: result.organization.id,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const deviceInfo = getDeviceInfo(req);

    await saveOrUpdateSession({
      userId: result.user.id,
      token,
      deviceInfo,
    });

    const { password: _, ...userData } = result.user;

    return res.status(201).json({
      message: "Kayıt Başarılı",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Kayıt işlemi başarısız oldu." });
  }
};

// login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          select: {
            organizationId: true,
            organization: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı Yok." });
    }

    if (!user.password) {
      return res.status(400).json({ error: "Bu hesap için şifre bulunamadı." });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Şifre yanlış." });
    }

    const activeOrgId =
      user.organizations.length > 0
        ? user.organizations[0].organizationId
        : null;

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        organizationId: activeOrgId,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const deviceInfo = getDeviceInfo(req);

    await saveOrUpdateSession({
      userId: user.id,
      token,
      deviceInfo,
    });

    const { password: _, ...userData } = user;

    return res.json({
      message: "Giriş Başarılı",
      token,
      user: userData,
      userOrganizations: user.organizations,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
};