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

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});



app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});