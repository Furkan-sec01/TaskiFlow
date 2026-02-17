const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

//kayıt ol
exports.register = async (req, res) => {
  const {email, password, name} = req.body;

  try{
    const existingUser = await prisma.user.findUnique({where: {email}});
    if(existingUser) return res.status(400).json({error: "E-posta Kullanımda."});

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {name: `${name}'s Workspace`}
      });

      return await tx.user.create({
        data: {
          email, password: hashedPassword, name,
          organizationId: org.id, status: "active"
        }
      });
    });

      const token = jwt.sign(
        {
          userId: newUser.id,
          email: newUser.email,
          organizationId: newUser.organizationId  
        },
        JWT_SECRET,
        {expiresIn: '24h'}
      );

      res.status(201).json({message: "Kayıt Başarılı",token, user: newUser});

  } catch(error){
    console.error("Register Error:", error);
    res.status(500).json({ error: error.message });
  }
}


//login
exports.login = async (req,res) => {
  const {email, password} = req.body;

  try{
    const user= await prisma.user.findUnique({where: {email}});
    if(!user) return await res.status(404).json({error: "Kullanıcı Yok."});

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Şifre yanlış." });

    const token = jwt.sign(
      {
        userId:user.id,
        email: user.email,
        organizationId: user.organizationId
      },
      JWT_SECRET,
      {expiresIn: '24h'}
    );

    const {password: _, ...userData} = user;
    res.json({ message: "Giriş Başarılı", token, user: userData });
  }catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}