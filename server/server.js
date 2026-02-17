// server.js (DÜZELTİLMİŞ HALİ)
const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes"); 
const userRoutes = require("./src/routes/userRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/users",userRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server Full Mod (Auth + Task) çalışıyor: http://localhost:${PORT}`);
});