const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const plantasRoutes = require('./routes/plantasRoutes');
const consultasRoutes = require('./routes/consultasRoutes');
const estadisticasRoutes = require('./routes/estadisticasRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const mlRoutes = require('./routes/mlRoutes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/plantas', plantasRoutes);
app.use('/api/consultas', consultasRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/ml', mlRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de Plantas Medicinales funcionando' });
});

// Puerto
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Endpoints disponibles:`);
    console.log(`   - GET  /api/estadisticas/resumen`);
    console.log(`   - GET  /api/estadisticas/top-plantas`);
    console.log(`   - GET  /api/estadisticas/consultas-por-dia`);
    console.log(`   - GET  /api/estadisticas/precision-por-planta`);
});