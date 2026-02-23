const express = require("express");
const cors = require("cors");
const app = express();


const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes"); 
const userRoutes = require("./src/routes/userRoutes");
const orgRoutes = require("./src/routes/organizationRoutes");
const notificRoutes = require("./src/routes/notificationRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/users",userRoutes);
app.use("/api/organizations",orgRoutes);
app.use("/api/notifications",notificRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server Full Mod (Auth + Task) çalışıyor: http://localhost:${PORT}`);
});