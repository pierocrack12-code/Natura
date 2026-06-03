const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const [usuarios] = await pool.query(`
            SELECT u.*, COUNT(c.id_consulta) as total_consultas
            FROM usuarios_app u
            LEFT JOIN consultas c ON u.id_usuario = c.id_usuario
            GROUP BY u.id_usuario
            ORDER BY u.fecha_registro DESC
        `);
        res.json({ success: true, usuarios });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al obtener usuarios' });
    }
});

// Obtener historial de un usuario
router.get('/:id/historial', async (req, res) => {
    const { id } = req.params;
    try {
        const [historial] = await pool.query(`
            SELECT p.nombre_comun as planta, c.confianza_ia as confianza, 
                   DATE(c.fecha_consulta) as fecha, c.fue_correcta as correcta
            FROM consultas c
            JOIN plantas p ON c.id_planta = p.id_planta
            WHERE c.id_usuario = ?
            ORDER BY c.fecha_consulta DESC
            LIMIT 20
        `, [id]);
        res.json({ success: true, historial });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al obtener historial' });
    }
});

// Obtener favoritos de un usuario
router.get('/:id/favoritos', async (req, res) => {
    const { id } = req.params;
    try {
        const [favoritos] = await pool.query(`
            SELECT p.id_planta, p.nombre_comun
            FROM favoritos f
            JOIN plantas p ON f.id_planta = p.id_planta
            WHERE f.id_usuario = ?
            ORDER BY f.fecha_agregado DESC
        `, [id]);
        res.json({ success: true, favoritos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al obtener favoritos' });
    }
});

// Obtener notas de un usuario
router.get('/:id/notas', async (req, res) => {
    const { id } = req.params;
    try {
        const [notas] = await pool.query(`
            SELECT n.*, p.nombre_comun
            FROM notas_personales n
            JOIN plantas p ON n.id_planta = p.id_planta
            WHERE n.id_usuario = ?
            ORDER BY n.fecha_creacion DESC
        `, [id]);
        res.json({ success: true, notas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al obtener notas' });
    }
});

// Cambiar estado del usuario
router.put('/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;
    try {
        await pool.query('UPDATE usuarios_app SET activo = ? WHERE id_usuario = ?', [activo, id]);
        res.json({ success: true, message: 'Estado actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al actualizar estado' });
    }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM usuarios_app WHERE id_usuario = ?', [id]);
        res.json({ success: true, message: 'Usuario eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al eliminar usuario' });
    }
});

module.exports = router;