const pool = require('../config/database');const registrarConsulta = async (req, res) => {
    const { id_usuario, id_planta, confianza_ia } = req.body;
    try {
        await pool.query(
            'INSERT INTO consultas (id_usuario, id_planta, confianza_ia) VALUES (?, ?, ?)',
            [id_usuario, id_planta, confianza_ia]
        );
        res.json({ success: true, message: 'Consulta guardada' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { registrarConsulta };
