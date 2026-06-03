const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener todas las plantas
router.get('/', async (req, res) => {
    try {
        const [plantas] = await pool.query('SELECT * FROM plantas ORDER BY nombre_comun');
        res.json({ success: true, plantas });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener una planta por ID
router.get('/:id', async (req, res) => {
    try {
        const [plantas] = await pool.query('SELECT * FROM plantas WHERE id_planta = ?', [req.params.id]);
        if (plantas.length === 0) return res.status(404).json({ success: false, error: 'Planta no encontrada' });
        res.json({ success: true, planta: plantas[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Crear planta
router.post('/', async (req, res) => {
    const { nombre_comun, nombre_cientifico, descripcion, propiedades, usos_tradicionales, advertencias, url_foto, etiqueta_ia } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO plantas (nombre_comun, nombre_cientifico, descripcion, propiedades, usos_tradicionales, advertencias, url_foto, etiqueta_ia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre_comun, nombre_cientifico, descripcion, propiedades, usos_tradicionales, advertencias, url_foto, etiqueta_ia]
        );
        res.json({ success: true, message: 'Planta creada', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Actualizar planta
router.put('/:id', async (req, res) => {
    const { nombre_comun, nombre_cientifico, descripcion, propiedades, usos_tradicionales, advertencias, url_foto, etiqueta_ia } = req.body;
    try {
        await pool.query(
            'UPDATE plantas SET nombre_comun=?, nombre_cientifico=?, descripcion=?, propiedades=?, usos_tradicionales=?, advertencias=?, url_foto=?, etiqueta_ia=? WHERE id_planta=?',
            [nombre_comun, nombre_cientifico, descripcion, propiedades, usos_tradicionales, advertencias, url_foto, etiqueta_ia, req.params.id]
        );
        res.json({ success: true, message: 'Planta actualizada' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Eliminar planta
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM plantas WHERE id_planta = ?', [req.params.id]);
        res.json({ success: true, message: 'Planta eliminada' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;