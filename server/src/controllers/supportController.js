const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.createSupportTicket = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Tüm alanları doldurun",
      });
    }

    // 1) DB’ye kaydet
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        name,
        email,
        subject,
        message,
      },
    });

    // 📅 TARİH
    const createdAt = new Date().toLocaleString("tr-TR");

    // 2) Mail gönder
    await transporter.sendMail({
      from: `"TaskiFlow Destek" <${process.env.MAIL_USER}>`,
      to: process.env.SUPPORT_MAIL_TO,
      replyTo: email,
      subject: `TaskiFlow Destek Talebi: ${subject}`,
      html: `
        <h2>📩 Yeni Destek Talebi</h2>
        <p><b>Ad:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Konu:</b> ${subject}</p>
        <p><b>Tarih:</b> ${createdAt}</p> <!-- 🔥 EKLENDİ -->
        <p><b>Mesaj:</b></p>
        <p>${message}</p>
        <hr/>
        <p style="color:gray;font-size:12px">
          Bu mesaj TaskiFlow uygulaması üzerinden gönderildi.
        </p>
      `,
    });

    return res.status(201).json({
      message: "Destek talebi gönderildi",
      ticket,
    });

  } catch (error) {
    console.log("SUPPORT ERROR:", error);
    return res.status(500).json({
      message: "Hata oluştu",
    });
  }
};