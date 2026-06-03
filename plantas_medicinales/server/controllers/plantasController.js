const pool = require('../config/database');

// Obtener plantas (soporta búsqueda por texto ?q=nombre)
const getPlantas = async (req, res) => {
    const { q } = req.query; 
    try {
        let query = 'SELECT * FROM plantas';
        let params = [];
        
        if (q) {
            query += ' WHERE nombre_comun LIKE ? OR nombre_cientifico LIKE ?';
            params = [`%${q}%`, `%${q}%`];
        }
        
        const [rows] = await pool.query(query, params);
        res.json({ success: true, plantas: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// BUSCAR POR ETIQUETA IA (Vital para que el panel de la cámara funcione)
const getPlantaByTag = async (req, res) => {
    const { tag } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM plantas WHERE etiqueta_ia = ?', [tag]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Planta no encontrada en la base de datos' });
        }
        
        res.json({ success: true, planta: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getPlantaById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM plantas WHERE id_planta = ?', [id]);
        res.json({ success: true, planta: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const createPlanta = async (req, res) => { res.json({ success: true, message: "Función no implementada" }); };
const updatePlanta = async (req, res) => { res.json({ success: true, message: "Función no implementada" }); };
const deletePlanta = async (req, res) => { res.json({ success: true, message: "Función no implementada" }); };

module.exports = {
    getPlantas,
    getPlantaById,
    getPlantaByTag,
    createPlanta,
    updatePlanta,
    deletePlanta
};