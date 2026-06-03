const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// --- LOGIN PARA LA APP MÓVIL (Android) ---
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios_app WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ success: false, error: 'Usuario no registrado' });

        const user = rows[0];
        // Soporta bcrypt o texto plano (para tus datos de prueba)
        const valid = (user.password_hash.startsWith('$2')) 
            ? await bcrypt.compare(password, user.password_hash)
            : (password === user.password_hash);

        if (!valid) return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });

        res.json({
            success: true,
            usuario: { id: user.id_usuario, nombre: user.nombre_completo, email: user.email, telefono: user.telefono }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- LOGIN PARA EL PANEL WEB (Administradores) ---
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [admins] = await pool.query('SELECT * FROM administradores WHERE email = ?', [email]);
        if (admins.length === 0) return res.status(401).json({ success: false, error: 'Admin no encontrado' });
        
        const admin = admins[0];
        const valid = (admin.password_hash && admin.password_hash.startsWith('$2'))
            ? await bcrypt.compare(password, admin.password_hash)
            : (password === admin.password || password === admin.password_hash);

        if (!valid) return res.status(401).json({ success: false, error: 'Clave incorrecta' });

        res.json({ success: true, admin: { id: admin.id_admin, nombre: admin.nombre, rol: admin.rol } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Otros métodos para que el router no falle
const getAdmins = async (req, res) => { res.json({ success: true, admins: [] }); };
const createAdmin = async (req, res) => { res.json({ success: true }); };
const updateAdmin = async (req, res) => { res.json({ success: true }); };
const deleteAdmin = async (req, res) => { res.json({ success: true }); };
const cambiarPassword = async (req, res) => { res.json({ success: true }); };

module.exports = { 
    loginUser, 
    loginAdmin, 
    getAdmins, 
    createAdmin, 
    updateAdmin, 
    deleteAdmin, 
    cambiarPassword 
};