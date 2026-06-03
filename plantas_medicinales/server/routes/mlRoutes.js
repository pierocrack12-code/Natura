const express = require('express');
const router = express.Router();

// Predicción de fallas
router.get('/prediccion-fallas', (req, res) => {
  res.json({
    success: true,
    precisionEsperada: 87,
    riesgoFallas: 'MEDIO',
    factoresRiesgo: ['⚠️ Confianza baja en consultas de Ruda', '⏱️ Tiempo de respuesta elevado'],
    recomendaciones: ['📸 Mejorar imágenes de Ruda y Paico', '🧠 Reentrenar modelo con más ejemplos']
  });
});

// Recomendaciones
router.get('/recomendaciones', (req, res) => {
  res.json({
    success: true,
    topRecomendaciones: [
      { planta: 'Manzanilla', puntuacion: 95, motivo: 'Alta en favoritos' },
      { planta: 'Menta', puntuacion: 88, motivo: 'Tendencia positiva' },
      { planta: 'Sábila', puntuacion: 82, motivo: 'Popular en consultas' }
    ],
    recomendaciones: [
      { nombre_usuario: 'María García', plantas_recomendadas: ['Manzanilla', 'Menta', 'Romero'] },
      { nombre_usuario: 'Carlos López', plantas_recomendadas: ['Sábila', 'Hierba Luisa'] }
    ]
  });
});

// Predicción de tendencias (qué plantas van a subir)
router.get('/tendencias', (req, res) => {
    // Datos simulados de tendencias de plantas
    const tendencias = [
        { planta: 'Manzanilla', tendencia: 'subiendo', porcentaje: 25, icono: '📈', prediccion: 'Alta demanda en los próximos días' },
        { planta: 'Menta', tendencia: 'subiendo', porcentaje: 18, icono: '📈', prediccion: 'Incremento constante' },
        { planta: 'Sábila', tendencia: 'estable', porcentaje: 5, icono: '➡️', prediccion: 'Mantendrá popularidad' },
        { planta: 'Romero', tendencia: 'subiendo', porcentaje: 12, icono: '📈', prediccion: 'Tendencia al alza' },
        { planta: 'Hierba Luisa', tendencia: 'bajando', porcentaje: -8, icono: '📉', prediccion: 'Disminución temporal' },
        { planta: 'Ruda', tendencia: 'bajando', porcentaje: -15, icono: '📉', prediccion: 'Baja temporal' }
    ];
    res.json({ success: true, tendencias });
});

module.exports = router;