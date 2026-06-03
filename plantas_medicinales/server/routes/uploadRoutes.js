const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Crear carpeta de uploads si no existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'planta-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtrar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Ruta para subir imagen
router.post('/imagen', upload.single('imagen'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No se subió ningún archivo' });
        }
        
        const imagenUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        res.json({ 
            success: true, 
            imagenUrl: imagenUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al subir imagen' });
    }
});

// Ruta para obtener una imagen
router.get('/imagen/:filename', (req, res) => {
    const filepath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
    } else {
        res.status(404).json({ error: 'Imagen no encontrada' });
    }
});

// Registro de usuario para app móvil
router.post('/registro-app', async (req, res) => {
    const { nombre_completo, email, telefono, password } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const [result] = await pool.query(
            'INSERT INTO usuarios_app (nombre_completo, email, telefono, password_hash) VALUES (?, ?, ?, ?)',
            [nombre_completo, email, telefono, password_hash]
        );
        
        res.json({ success: true, message: 'Usuario registrado', id_usuario: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, error: 'El email ya está registrado' });
        } else {
            res.status(500).json({ success: false, error: 'Error al registrar usuario' });
        }
    }
});

// Login para app móvil
router.post('/login-app', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [usuarios] = await pool.query(
            'SELECT * FROM usuarios_app WHERE email = ? AND activo = 1',
            [email]
        );
        
        if (usuarios.length === 0) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }
        
        const usuario = usuarios[0];
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        
        if (!passwordValida) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }
        
        // Actualizar último acceso
        await pool.query('UPDATE usuarios_app SET ultimo_acceso = NOW() WHERE id_usuario = ?', [usuario.id_usuario]);
        
        res.json({
            success: true,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre_completo,
                email: usuario.email,
                telefono: usuario.telefono
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
});

// Servir archivos estáticos
router.use('/uploads', express.static(uploadDir));

module.exports = router;