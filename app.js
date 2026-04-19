require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
const companyRoutes = require('./src/routes/companyRoutes');
app.use('/api/companies', companyRoutes);

const manufacturingUnitRoutes = require('./src/routes/manufacturingUnitRoutes');
app.use('/api/manufacturingUnits',manufacturingUnitRoutes)

const equipmentTypeRoutes = require('./src/routes/equipmentTypeRoutes');
app.use('/api/equipmentTypes', equipmentTypeRoutes);

const technicianRoutes = require('./src/routes/technicianRoutes');
app.use('/api/technicians', technicianRoutes);

const costCategoryRoutes = require('./src/routes/costCategoryRoutes');
app.use('/api/costCategories', costCategoryRoutes);

const maintenanceRoutes = require('./src/routes/maintenanceRoutes');
app.use('/api/maintenances', maintenanceRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});



app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});