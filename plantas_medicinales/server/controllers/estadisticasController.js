const pool = require('../config/database');

const getEstadisticas = async (req, res) => {
    try {
        const [totalConsultas] = await pool.query('SELECT COUNT(*) as total FROM consultas');
        const [consultasHoy] = await pool.query('SELECT COUNT(*) as total FROM consultas WHERE DATE(fecha_consulta) = CURDATE()');
        const [consultasMes] = await pool.query('SELECT COUNT(*) as total FROM consultas WHERE MONTH(fecha_consulta) = MONTH(CURDATE())');
        const [precisionPromedio] = await pool.query('SELECT AVG(confianza_ia) as promedio FROM consultas');
        
        res.json({
            success: true,
            estadisticas: {
                totalConsultas: totalConsultas[0].total,
                consultasHoy: consultasHoy[0].total,
                consultasMes: consultasMes[0].total,
                precisionPromedio: Math.round(precisionPromedio[0].promedio || 0)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
};

const getTopPlantas = async (req, res) => {
    try {
        const [topPlantas] = await pool.query(`
            SELECT p.id_planta, p.nombre_comun, p.url_foto, COUNT(c.id_consulta) as total_consultas
            FROM plantas p
            LEFT JOIN consultas c ON p.id_planta = c.id_planta
            GROUP BY p.id_planta
            ORDER BY total_consultas DESC
            LIMIT 5
        `);
        
        res.json({ success: true, topPlantas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al obtener top plantas' });
    }
};

const getConsultasPorDia = async (req, res) => {
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
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al obtener consultas por día' });
    }
};

const getPrecisionPorPlanta = async (req, res) => {
    try {
        const [precision] = await pool.query(`
            SELECT p.nombre_comun, AVG(c.confianza_ia) as precision_promedio, COUNT(c.id_consulta) as total_consultas
            FROM plantas p
            JOIN consultas c ON p.id_planta = c.id_planta
            GROUP BY p.id_planta
            ORDER BY precision_promedio DESC
        `);
        
        res.json({ success: true, precision });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al obtener precisión por planta' });
    }
};

// Exportar todas las funciones
module.exports = { 
    getEstadisticas, 
    getTopPlantas, 
    getConsultasPorDia,
    getPrecisionPorPlanta 
};