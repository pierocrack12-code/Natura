const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Login de administrador
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [admins] = await pool.query(
            'SELECT * FROM administradores WHERE email = ? AND password = ?',
            [email, password]
        );
        
        if (admins.length === 0) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }
        
        const admin = admins[0];
        
        await pool.query(
            'UPDATE administradores SET ultimo_acceso = NOW() WHERE id_admin = ?',
            [admin.id_admin]
        );
        
        res.json({
            success: true,
            admin: {
                id: admin.id_admin,
                nombre: admin.nombre,
                email: admin.email,
                rol: admin.rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
});

// Obtener todos los administradores
router.get('/admins', async (req, res) => {
    try {
        const [admins] = await pool.query('SELECT id_admin, nombre, email, rol, activo FROM administradores');
        res.json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener administradores' });
    }
});

// Crear administrador
router.post('/admins', async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO administradores (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, password, rol || 'administrador']
        );
        res.json({ success: true, message: 'Administrador creado', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al crear administrador' });
    }
});

// Actualizar administrador
router.put('/admins/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, email, activo } = req.body;
    try {
        await pool.query('UPDATE administradores SET nombre = ?, email = ?, activo = ? WHERE id_admin = ?', [nombre, email, activo, id]);
        res.json({ success: true, message: 'Administrador actualizado' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al actualizar' });
    }
});

// Eliminar administrador
router.delete('/admins/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM administradores WHERE id_admin = ?', [id]);
        res.json({ success: true, message: 'Administrador eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al eliminar' });
    }
});

// Cambiar contraseña
router.put('/admins/:id/password', async (req, res) => {
    const { id } = req.params;
    const { nueva_password } = req.body;
    try {
        await pool.query('UPDATE administradores SET password = ? WHERE id_admin = ?', [nueva_password, id]);
        res.json({ success: true, message: 'Contraseña actualizada' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al cambiar contraseña' });
    }
});

module.exports = router;