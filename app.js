require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 🔓 ROTAS PÚBLICAS (Não exigem Token)
// ==========================================

// Importante: A rota de usuários precisa ficar solta para que o front-end 
// consiga fazer o POST para /api/users/login e pegar o Token!
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);


// ==========================================
// 🔐 MIDDLEWARE DE SEGURANÇA (O Cadeado)
// ==========================================
const authMiddleware = require('./src/middlewares/authMiddleware');
// Daqui para baixo, NENHUMA rota funciona sem enviar o Token no Header!
app.use(authMiddleware);


// ==========================================
// 🔒 ROTAS PROTEGIDAS (Exigem Token JWT)
// ==========================================

const companyRoutes = require('./src/routes/companyRoutes');
app.use('/api/companies', companyRoutes);

const manufacturingUnitRoutes = require('./src/routes/manufacturingUnitRoutes');
app.use('/api/manufacturingUnits', manufacturingUnitRoutes);

const equipmentTypeRoutes = require('./src/routes/equipmentTypeRoutes');
app.use('/api/equipmentTypes', equipmentTypeRoutes);

const technicianRoutes = require('./src/routes/technicianRoutes');
app.use('/api/technicians', technicianRoutes);

const costCategoryRoutes = require('./src/routes/costCategoryRoutes');
app.use('/api/costCategories', costCategoryRoutes);

const maintenanceRoutes = require('./src/routes/maintenanceRoutes');
app.use('/api/maintenances', maintenanceRoutes);

const maintenanceCostRoutes = require('./src/routes/maintenanceCostRoutes');
app.use('/api/maintenanceCosts', maintenanceCostRoutes);

const visitRoutes = require('./src/routes/visitRoutes');
app.use('/api/visits', visitRoutes);

const visitLogRoutes = require('./src/routes/visitLogRoutes');
app.use('/api/visitLogs', visitLogRoutes);

const profileRoutes = require('./src/routes/profileRoutes');
app.use('/api/profiles', profileRoutes);

// ==========================================
// TRATAMENTO DE ERROS GLOBAIS
// ==========================================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});