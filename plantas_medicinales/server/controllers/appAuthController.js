const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// LOGIN PARA LA APP
exports.loginApp = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM usuarios_app WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
        }
        const user = users[0];
        
        // Comprobar contraseña (soporta texto plano para pruebas o bcrypt)
        const valid = (user.password_hash.startsWith('$2'))
            ? await bcrypt.compare(password, user.password_hash)
            : (password === user.password_hash);

        if (!valid) return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });

        res.json({
            success: true,
            usuario: {
                id: user.id_usuario,
                nombre: user.nombre_completo,
                email: user.email,
                telefono: user.telefono
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

// REGISTRO PARA LA APP
exports.registerApp = async (req, res) => {
    const { nombre_completo, email, telefono, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO usuarios_app (nombre_completo, email, telefono, password_hash) VALUES (?, ?, ?, ?)',
            [nombre_completo, email, telefono, hash]
        );
        res.json({ success: true, message: 'Registro exitoso' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'El email ya existe' });
    }
};