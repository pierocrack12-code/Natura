const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Registrar una consulta
router.post('/', async (req, res) => {
    const { id_usuario, id_planta, confianza_ia, tiempo_respuesta_ms, fue_correcta } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO consultas (id_usuario, id_planta, confianza_ia, tiempo_respuesta_ms, fue_correcta) VALUES (?, ?, ?, ?, ?)',
            [id_usuario, id_planta, confianza_ia, tiempo_respuesta_ms, fue_correcta]
        );
        await pool.query('UPDATE plantas SET veces_consultada = veces_consultada + 1 WHERE id_planta = ?', [id_planta]);
        res.json({ success: true, message: 'Consulta registrada', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener últimas consultas
router.get('/', async (req, res) => {
    try {
        const [consultas] = await pool.query(`
            SELECT c.*, p.nombre_comun 
            FROM consultas c 
            JOIN plantas p ON c.id_planta = p.id_planta 
            ORDER BY c.fecha_consulta DESC 
            LIMIT 50
        `);
        res.json({ success: true, consultas });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;