const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Resumen de estadísticas
router.get('/resumen', async (req, res) => {
    try {
        console.log('📊 Obteniendo resumen de estadísticas...');
        
        const [totalConsultas] = await pool.query('SELECT COUNT(*) as total FROM consultas');
        const [consultasHoy] = await pool.query('SELECT COUNT(*) as total FROM consultas WHERE DATE(fecha_consulta) = CURDATE()');
        const [consultasMes] = await pool.query('SELECT COUNT(*) as total FROM consultas WHERE MONTH(fecha_consulta) = MONTH(CURDATE())');
        const [precision] = await pool.query('SELECT AVG(confianza_ia) as promedio FROM consultas');
        
        const resultado = {
            success: true,
            estadisticas: {
                totalConsultas: totalConsultas[0]?.total || 0,
                consultasHoy: consultasHoy[0]?.total || 0,
                consultasMes: consultasMes[0]?.total || 0,
                precisionPromedio: Math.round(precision[0]?.promedio || 0)
            }
        };
        
        console.log('✅ Resumen enviado:', resultado);
        res.json(resultado);
        
    } catch (error) {
        console.error('❌ Error en /resumen:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Top plantas más consultadas
router.get('/top-plantas', async (req, res) => {
    try {
        const [top] = await pool.query(`
            SELECT p.id_planta, p.nombre_comun, COUNT(c.id_consulta) as total_consultas
            FROM plantas p
            LEFT JOIN consultas c ON p.id_planta = c.id_planta
            GROUP BY p.id_planta
            ORDER BY total_consultas DESC
            LIMIT 5
        `);
        res.json({ success: true, topPlantas: top });
    } catch (error) {
        console.error('❌ Error en /top-plantas:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Consultas por día (últimos 7 días)
router.get('/consultas-por-dia', async (req, res) => {
    try {
        const [consultas] = await pool.query(`
            SELECT DATE(fecha_consulta) as fecha, COUNT(*) as total
            FROM consultas
            WHERE fecha_consulta >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(fecha_consulta)
            ORDER BY fecha ASC
        `);
        res.json({ success: true, consultas });
    } catch (error) {
        console.error('❌ Error en /consultas-por-dia:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Precisión por planta
router.get('/precision-por-planta', async (req, res) => {
    try {
        const [precision] = await pool.query(`
            SELECT 
                p.nombre_comun,
                COUNT(c.id_consulta) as total,
                SUM(CASE WHEN c.fue_correcta = 1 THEN 1 ELSE 0 END) as aciertos,
                ROUND(AVG(c.confianza_ia), 1) as precision
            FROM plantas p
            LEFT JOIN consultas c ON p.id_planta = c.id_planta
            GROUP BY p.id_planta
            HAVING total > 0
            ORDER BY precision DESC
        `);
        res.json({ success: true, precision });
    } catch (error) {
        console.error('❌ Error en /precision-por-planta:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;