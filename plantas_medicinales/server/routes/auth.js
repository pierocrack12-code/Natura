const express = require('express');
const router = express.Router();

// RUTA: POST http://tu-ip:5000/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // AQUÍ DEBES BUSCAR EN TU BASE DE DATOS REAL
        // Ejemplo de respuesta que espera tu App:
        if (email === "test@gmail.com" && password === "123456") {
            res.json({
                success: true,
                usuario: {
                    id: 1,
                    nombre: "Usuario de Prueba",
                    email: email,
                    telefono: "123456789"
                }
            });
        } else {
            res.status(401).json({
                success: false,
                error: "Credenciales incorrectas"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: "Error en el servidor" });
    }
});

// RUTA: POST http://tu-ip:5000/auth/register
router.post('/register', async (req, res) => {
    const { nombre_completo, email, password, telefono } = req.body;
    // Aquí agregas la lógica para guardar en tu Base de Datos
    res.json({ success: true, message: "Usuario registrado con éxito" });
});

module.exports = router;