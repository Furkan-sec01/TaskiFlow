const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 🔥 YARDIMCI FONKSİYON: BİLDİRİM KAYDET (Organization bazlı)
async function createNotif(message, type, organizationId) {
  if (!organizationId) {
    console.error("createNotif: organizationId gereklidir!");
    return;
  }
  try {
    await prisma.notification.create({
      data: { message, type, organizationId } 
    });
  } catch (e) {
    console.error("Bildirim hatası:", e);
  }
}

// ==========================================
// 1. GİRİŞ VE KULLANICI İŞLEMLERİ
// ==========================================

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  // Validasyon
  if (!email || !password) {
    return res.status(400).json({ error: "E-posta ve şifre gereklidir." });
  }

  try {
    let user = await prisma.user.findUnique({ 
      where: { email }
    });
    
    // Admin yoksa oluştur (şifreyi hash'le ve organization oluştur)
    if (!user && email === "admin@test.com") {
      const hashedPassword = await bcrypt.hash("123", 10);
      
      // Transaction ile Organization ve User oluştur
      const result = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: { name: "Admin's Team" }
        });
        
        const newUser = await tx.user.create({ 
          data: { 
            email, 
            password: hashedPassword, 
            name: "Admin",
            organizationId: org.id
          },
          include: { organization: true }
        });
        
        return newUser;
      });
      
      user = result;
    }

    if (!user) {
      return res.status(401).json({ error: "Hatalı e-posta veya şifre!" });
    }

    // Eğer kullanıcının organizationId'si yoksa (eski kullanıcılar için), otomatik oluştur
    if (!user.organizationId) {
      user = await prisma.$transaction(async (tx) => {
        // Kullanıcı için yeni organization oluştur
        const org = await tx.organization.create({
          data: { name: `${user.name || user.email}'s Team` }
        });
        
        // Kullanıcıyı organization'a bağla
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { organizationId: org.id },
          include: { organization: true }
        });
        
        return updatedUser;
      });
    } else {
      // Organization bilgisini al
      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { organization: true }
      });
    }

    // Şifre kontrolü: Önce bcrypt ile kontrol et, eğer hash'lenmemişse (eski kullanıcılar için) plain text kontrol et
    const isPasswordValid = user.password.startsWith("$2") 
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Hatalı e-posta veya şifre!" });
    }

    // Şifreyi yanıttan çıkar
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ message: "Hoşgeldin!", user: userWithoutPassword });
  } catch (error) { 
    console.error("Giriş hatası:", error);
    res.status(500).json({ error: "Giriş yapılırken hata oluştu." }); 
  }
});

app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    
    // Validasyon: Gerekli alanları kontrol et
    if (!email || !password || !name) {
        return res.status(400).json({ error: "E-posta, şifre ve ad alanları zorunludur." });
    }

    try {
        // 1. Kullanıcı zaten var mı kontrol et
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Bu e-posta adresi zaten kullanılıyor." });
        }

        // 2. Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Transaction ile Organization ve User oluştur
        const result = await prisma.$transaction(async (tx) => {
            // Yeni Organization oluştur
            const organization = await tx.organization.create({
                data: { 
                    name: `${name}'s Team` 
                }
            });

            // Yeni kullanıcı oluştur ve organization'a bağla
            const newUser = await tx.user.create({ 
                data: { 
                    email, 
                    password: hashedPassword, 
                    name,
                    organizationId: organization.id
                },
                include: { organization: true }
            });

            return newUser;
        });

        // 4. Şifreyi yanıttan çıkar (güvenlik için)
        const { password: _, ...userWithoutPassword } = result;
        
        res.status(201).json({ 
            message: "Kullanıcı başarıyla oluşturuldu!", 
            user: userWithoutPassword 
        });
    } catch(e) { 
        console.error("Kayıt hatası:", e);
        
        // Daha detaylı hata mesajları
        if (e.code === 'P2002') {
            return res.status(400).json({ error: "Bu e-posta adresi zaten kullanılıyor." });
        }
        
        if (e.code === 'P2003') {
            return res.status(500).json({ 
                error: "Veritabanı hatası: Organization tablosu bulunamadı. Lütfen migration çalıştırın: npx prisma migrate dev" 
            });
        }
        
        if (e.message && e.message.includes('organization')) {
            return res.status(500).json({ 
                error: "Veritabanı hatası: Organization tablosu veya organizationId kolonu bulunamadı. Lütfen migration çalıştırın: npx prisma migrate dev",
                details: e.message
            });
        }
        
        res.status(500).json({ 
            error: "Sunucu hatası oluştu. Lütfen tekrar deneyin.",
            details: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
});

// ==========================================
// 2. EKİP YÖNETİMİ (BU KISIM EKSİKTİ, GERİ GELDİ!) ✅
// ==========================================

// Tüm Kullanıcıları Getir (Ekip Sayfası İçin) - Sadece aynı organizasyondaki kullanıcılar
app.get("/api/users", async (req, res) => {
  const { userId } = req.query;
  
  // userId zorunlu - hangi kullanıcının organizasyonundaki üyeleri getireceğimizi bilmemiz gerekiyor
  if (!userId) {
    return res.status(400).json({ error: "userId parametresi gereklidir." });
  }

  try {
    // İstek yapan kullanıcıyı bul
    const requestingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { organizationId: true }
    });

    if (!requestingUser) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Aynı organizasyondaki tüm kullanıcıları getir
    const users = await prisma.user.findMany({
      where: { 
        organizationId: requestingUser.organizationId 
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
        organizationId: true,
        status: true
      }
    });

    res.json(users);
  } catch (e) { 
    console.error("Kullanıcılar alınamadı:", e);
    res.status(500).json({ error: "Kullanıcılar alınamadı" }); 
  }
});

// Tüm Kullanıcıları Getir (Toplu Mail İçin) - Email ve Name bilgileri
app.get("/api/users/all", async (req, res) => {
  try {
    // Tüm kullanıcıları getir (sadece email ve name)
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true
      }
    });

    res.json(users);
  } catch (e) { 
    console.error("Kullanıcılar alınamadı:", e);
    res.status(500).json({ error: "Kullanıcılar alınamadı" }); 
  }
});

// Kullanıcı Davet Et (Aynı organizasyona ekler)
app.post("/api/invite", async (req, res) => {
  const { email, name, inviterUserId } = req.body;
  
  // inviterUserId zorunlu - hangi kullanıcının organizasyonuna ekleneceğini bilmemiz gerekiyor
  if (!inviterUserId) {
    return res.status(400).json({ error: "inviterUserId gereklidir." });
  }

  try {
    // Davet eden kullanıcıyı bul ve organizasyonunu al
    const inviter = await prisma.user.findUnique({
      where: { id: parseInt(inviterUserId) },
      select: { organizationId: true }
    });

    if (!inviter) {
      return res.status(404).json({ error: "Davet eden kullanıcı bulunamadı." });
    }

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      // Eğer kullanıcı zaten varsa ve farklı bir organizasyondaysa, hata döndür
      if (existingUser.organizationId !== inviter.organizationId) {
        return res.status(400).json({ 
          error: "Bu kullanıcı zaten başka bir organizasyonda kayıtlı." 
        });
      }
      // Aynı organizasyondaysa, mevcut kullanıcıyı dön
      return res.status(200).json({ 
        message: "Kullanıcı zaten bu organizasyonda kayıtlı.",
        user: existingUser
      });
    }

    // Şifreyi hash'le (varsayılan: "123")
    const hashedPassword = await bcrypt.hash("123", 10);

    // Benzersiz verification token oluştur
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Yeni kullanıcıyı aynı organizasyona ekle (pending status ile)
    const newUser = await prisma.user.create({ 
      data: { 
        email, 
        name: name || "Yeni Üye", 
        password: hashedPassword,
        organizationId: inviter.organizationId,
        status: "pending",
        verificationToken: verificationToken
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
        organizationId: true,
        status: true,
        verificationToken: true
      }
    });
    
    // Bildirim ekle (inviter'ın organizationId'si ile)
    await createNotif(`${name || email} davet edildi (Onay bekliyor)`, "info", inviter.organizationId);

    // Token'ı response'a ekle (frontend'de email'e göndermek için)
    res.json({
      ...newUser,
      token: verificationToken
    });
  } catch (e) { 
    console.error("Davet hatası:", e);
    res.status(500).json({ error: "Kullanıcı davet edilemedi." }); 
  }
});

// Kullanıcı Sil (Ekipten Çıkar) - Sadece aynı organizasyondaki kullanıcılar silinebilir
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { requesterUserId } = req.query; // İstek yapan kullanıcının ID'si
  
  if (!requesterUserId) {
    return res.status(400).json({ error: "requesterUserId gereklidir." });
  }

  try {
    // Silinecek kullanıcıyı bul
    const userToDelete = await prisma.user.findUnique({ 
      where: { id: parseInt(id) },
      select: { id: true, name: true, organizationId: true }
    });

    if (!userToDelete) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // İstek yapan kullanıcıyı bul
    const requester = await prisma.user.findUnique({
      where: { id: parseInt(requesterUserId) },
      select: { organizationId: true }
    });

    if (!requester) {
      return res.status(404).json({ error: "İstek yapan kullanıcı bulunamadı." });
    }

    // Aynı organizasyonda mı kontrol et
    if (userToDelete.organizationId !== requester.organizationId) {
      return res.status(403).json({ error: "Bu kullanıcıyı silme yetkiniz yok." });
    }

    // Kullanıcıyı sil
    await prisma.user.delete({ where: { id: parseInt(id) } });
    
    // Bildirim ekle (requester'ın organizationId'si ile)
    await createNotif(`${userToDelete.name} ekipten çıkarıldı.`, "alert", requester.organizationId);

    res.json({ success: true });
  } catch (error) { 
    console.error("Silme hatası:", error);
    res.status(500).json({ error: "Silinemedi" }); 
  }
});

// Kullanıcı Bilgilerini Getir (Ayarlar Sayfası İçin)
app.get("/api/users/me", async (req, res) => {
  const { email, id } = req.query;
  try {
    let user;
    if (id) {
      user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    } else {
      return res.status(400).json({ error: "E-posta veya ID gereklidir." });
    }

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Şifreyi yanıttan çıkar
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Kullanıcı bilgisi hatası:", error);
    res.status(500).json({ error: "Kullanıcı bilgisi alınamadı." });
  }
});

// Kullanıcı Onaylama (Verification)
app.post("/api/verify", async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: "Token gereklidir." });
  }

  try {
    // Token ile kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      select: { id: true, email: true, name: true, status: true }
    });

    if (!user) {
      return res.status(404).json({ error: "Geçersiz veya süresi dolmuş token." });
    }

    if (user.status === "active") {
      return res.status(200).json({ 
        message: "Kullanıcı zaten aktif.",
        user: { id: user.id, email: user.email, name: user.name }
      });
    }

    // Kullanıcıyı aktif yap ve token'ı temizle
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        status: "active",
        verificationToken: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        organizationId: true
      }
    });

    // Bildirim ekle (kullanıcının organizationId'si ile)
    await createNotif(`${user.name || user.email} hesabını onayladı!`, "success", updatedUser.organizationId);

    res.json({ 
      success: true,
      message: "Hesap başarıyla aktifleştirildi!",
      user: updatedUser
    });
  } catch (error) {
    console.error("Onaylama hatası:", error);
    res.status(500).json({ error: "Onaylama işlemi sırasında hata oluştu." });
  }
});

// Profil Güncelle (Ayarlar Sayfası İçin)
app.put("/api/users/profile", async (req, res) => {
  const { email, id, name, bio } = req.body;
  
  if (!email && !id) {
    return res.status(400).json({ error: "E-posta veya ID gereklidir." });
  }

  try {
    // Güncellenecek kullanıcıyı bul
    const where = id ? { id: parseInt(id) } : { email };
    const existingUser = await prisma.user.findUnique({ where });
    
    if (!existingUser) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Güncelleme verilerini hazırla
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where,
      data: updateData
    });

    // Şifreyi yanıttan çıkar
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    res.json({ 
      message: "Profil başarıyla güncellendi!", 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    res.status(500).json({ error: "Profil güncellenirken hata oluştu." });
  }
});


// ==========================================
// 3. GÖREV YÖNETİMİ
// ==========================================

app.get("/api/tasks", async (req, res) => {
  const { userId, requesterUserId } = req.query;
  if (!userId) return res.json([]); 

  try {
    // İstek yapan kullanıcıyı bul (organizasyon kontrolü için)
    let requester = null;
    if (requesterUserId) {
      requester = await prisma.user.findUnique({
        where: { id: parseInt(requesterUserId) },
        select: { organizationId: true }
      });
    }

    // Görev sahibi kullanıcıyı bul
    const taskOwner = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { organizationId: true }
    });

    if (!taskOwner) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Organizasyon kontrolü (eğer requester varsa)
    if (requester && requester.organizationId !== taskOwner.organizationId) {
      return res.status(403).json({ error: "Bu görevlere erişim yetkiniz yok." });
    }

    // Görevleri getir (zaten userId ile filtrelenmiş, organizasyon kontrolü yapıldı)
    const tasks = await prisma.task.findMany({ 
        where: { project: { userId: parseInt(userId) } },
        orderBy: { createdAt: "desc" },
        include: { project: true }
    });
    res.json(tasks);
  } catch (e) { 
    console.error("Görev getirme hatası:", e);
    res.status(500).json({ error: "Hata" }); 
  }
});

app.post("/api/tasks", async (req, res) => {
  const { title, date, priority, userId } = req.body;
  try {
    // Kullanıcının organizationId'sini al
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { organizationId: true }
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    let defaultProject = await prisma.project.findFirst({ where: { userId: parseInt(userId), name: "Genel" } });
    if (!defaultProject) {
       defaultProject = await prisma.project.create({ data: { name: "Genel", userId: parseInt(userId) } });
    }

    const newTask = await prisma.task.create({ 
      data: { 
          title, priority: priority || "MEDIUM", status: "TODO",
          dueDate: date ? new Date(date) : null,
          projectId: defaultProject.id 
      } 
    });

    // Bildirim ekle (kullanıcının organizationId'si ile)
    await createNotif(`Yeni görev: "${title}"`, "success", user.organizationId);
    res.json(newTask);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try { 
    // Task'ı bul ve organizationId'sini al
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        project: {
          include: {
            user: {
              select: { organizationId: true }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: "Görev bulunamadı." });
    }

    const organizationId = task.project.user.organizationId;
    
    await prisma.task.delete({ where: { id: parseInt(req.params.id) } });
    
    // Bildirim ekle (organizationId ile)
    await createNotif("Bir görev silindi.", "alert", organizationId);
    res.json({ success: true }); 
  } catch (e) { 
    console.error("Görev silme hatası:", e);
    res.status(500).json({ error: "Hata" }); 
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  const { status } = req.body;
  try { 
    // Task'ı bul ve organizationId'sini al
    const taskBeforeUpdate = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        project: {
          include: {
            user: {
              select: { organizationId: true }
            }
          }
        }
      }
    });

    if (!taskBeforeUpdate) {
      return res.status(404).json({ error: "Görev bulunamadı." });
    }

    const organizationId = taskBeforeUpdate.project.user.organizationId;
    
    const task = await prisma.task.update({ 
      where: { id: parseInt(req.params.id) }, 
      data: { status } 
    });
    
    if (status === "DONE" || status === "Tamamlandı") {
        // Bildirim ekle (organizationId ile)
        await createNotif(`"${task.title}" tamamlandı! 🎉`, "success", organizationId);
    }
    res.json({ success: true }); 
  } catch (e) { 
    console.error("Görev güncelleme hatası:", e);
    res.status(500).json({ error: "Hata" }); 
  }
});

// Bildirimler - Sadece kullanıcının organizasyonundaki bildirimler
app.get("/api/notifications", async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.json([]);
  }

  try {
    // Kullanıcının organizationId'sini al
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { organizationId: true }
    });

    if (!user) {
      return res.json([]);
    }

    // Sadece kullanıcının organizasyonundaki bildirimleri getir
    const notifs = await prisma.notification.findMany({ 
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: "desc" }, 
      take: 10 
    });
    res.json(notifs);
  } catch (e) { 
    console.error("Bildirim getirme hatası:", e);
    res.json([]); 
  }
});

// ==========================================
// 4. ÖDEME İŞLEMLERİ
// ==========================================

// Checkout Session Oluştur (Ödeme Sayfası)
app.post("/api/create-checkout-session", async (req, res) => {
  const { planName, price } = req.body;
  
  try {
    // Validasyon
    if (!planName || price === undefined) {
      return res.status(400).json({ error: "Plan adı ve fiyat gereklidir." });
    }

    // Şimdilik demo modunda - gerçek Stripe entegrasyonu için Stripe API key gerekir
    // Demo için başarılı bir yanıt döndürüyoruz
    // Gerçek uygulamada burada Stripe Checkout Session oluşturulur
    
    // Demo: Kullanıcıyı başarı sayfasına yönlendir
    // Gerçek uygulamada: const session = await stripe.checkout.sessions.create({...})
    
    res.json({ 
      message: "Ödeme işlemi başlatıldı (Demo Modu)",
      url: `/payment-success?plan=${encodeURIComponent(planName)}&price=${price}`,
      // Gerçek Stripe için: url: session.url
      demo: true
    });
    
  } catch (error) {
    console.error("Checkout hatası:", error);
    res.status(500).json({ error: "Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin." });
  }
});

// Ödeme Başarı Sayfası (Demo)
app.get("/api/payment-success", async (req, res) => {
  const { plan, price } = req.query;
  res.json({ 
    success: true, 
    message: "Ödeme başarıyla tamamlandı!",
    plan,
    price 
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
});