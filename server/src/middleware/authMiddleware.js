const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  
  if (!token) return res.status(401).json({ error: "Erişim reddedildi. Token yok." });

 
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Geçersiz veya süresi dolmuş token." });
    
    req.user = user; 
    next(); 
  });
};

module.exports = authenticateToken;const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Erişim reddedildi. Token yok." });
    }

    const user = jwt.verify(token, JWT_SECRET);

    const session = await prisma.userSession.findFirst({
      where: {
        token,
        userId: user.userId,
      },
    });

    if (!session) {
      return res.status(401).json({
        error: "Oturum sonlandırılmış. Lütfen tekrar giriş yapın.",
      });
    }

    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActive: new Date() },
    });

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      error: "Geçersiz veya süresi dolmuş token.",
    });
  }
};

module.exports = authenticateToken;