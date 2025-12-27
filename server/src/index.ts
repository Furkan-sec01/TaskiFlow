import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes'; // YENİ: Rota dosyasını çağırdık

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rotaları Aktif Et
app.use('/api/auth', authRoutes);

// Test Rotası
app.get('/', async (req, res) => {
  res.json({ message: 'TaskiFlow Backend çalışıyor! 🚀' });
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});