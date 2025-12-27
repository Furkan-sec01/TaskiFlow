import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "gizli-super-anahtar"; // Bunu .env dosyasına da koyabilirsin

// --- KAYIT OL (REGISTER) ---
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu!', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};

// --- GİRİŞ YAP (LOGIN) --- YENİ EKLENEN KISIM
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // 1. Kullanıcıyı bul
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Kullanıcı bulunamadı.' });
    }

    // 2. Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Hatalı şifre!' });
    }

    // 3. Token oluştur (Giriş bileti)
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h', // 1 saat geçerli
    });

    // 4. Başarılı yanıt dön
    res.json({ message: 'Giriş başarılı!', token, user: { id: user.id, name: user.name, email: user.email } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Giriş yapılırken hata oluştu.' });
  }
};