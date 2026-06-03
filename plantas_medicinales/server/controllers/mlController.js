const pool = require('../config/database');

// 1. Predicción de fallas en reconocimiento
const predecirFallas = async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT 
        AVG(confianza_ia) as confianza_promedio,
        AVG(tiempo_respuesta_ms) as tiempo_promedio,
        SUM(CASE WHEN fue_correcta = 0 THEN 1 ELSE 0 END) as total_fallas,
        COUNT(*) as total
      FROM consultas
      WHERE fecha_consulta >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    const riesgo = result[0].confianza_promedio < 75 ? 'ALTO' : (result[0].confianza_promedio < 85 ? 'MEDIO' : 'BAJO');
    
    res.json({
      success: true,
      precisionEsperada: Math.round(result[0].confianza_promedio || 85),
      riesgoFallas: riesgo,
      factoresRiesgo: [
        result[0].confianza_promedio < 80 ? '⚠️ Confianza baja en consultas recientes' : null,
        result[0].tiempo_promedio > 2000 ? '⏱️ Tiempo de respuesta elevado' : null,
        result[0].total_fallas > result[0].total * 0.2 ? '📉 Alto número de fallas recientes' : null
      ].filter(Boolean),
      recomendaciones: [
        '📸 Mejorar calidad de imágenes en condiciones de poca luz',
        '🧠 Reentrenar modelo con plantas similares que generan confusión',
        '📊 Recopilar más datos de usuarios para mejorar precisión'
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Sistema de recomendación de plantas
const recomendarPlantas = async (req, res) => {
  try {
    // Top plantas basado en favoritos + consultas + notas
    const [topRecomendaciones] = await pool.query(`
      SELECT 
        p.nombre_comun,
        COUNT(DISTINCT f.id_favorito) as favoritos,
        COUNT(DISTINCT c.id_consulta) as consultas,
        COUNT(DISTINCT n.id_nota) as notas,
        (COUNT(DISTINCT f.id_favorito) * 3 + COUNT(DISTINCT c.id_consulta) * 2 + COUNT(DISTINCT n.id_nota) * 4) as puntuacion
      FROM plantas p
      LEFT JOIN favoritos f ON p.id_planta = f.id_planta
      LEFT JOIN consultas c ON p.id_planta = c.id_planta
      LEFT JOIN notas_personales n ON p.id_planta = n.id_planta
      GROUP BY p.id_planta
      ORDER BY puntuacion DESC
      LIMIT 5
    `);
    
    // Recomendaciones personalizadas por usuario
    const [recomendaciones] = await pool.query(`
      SELECT 
        u.id_usuario,
        u.nombre_completo as nombre_usuario,
        GROUP_CONCAT(DISTINCT p.nombre_comun ORDER BY puntuacion DESC SEPARATOR ',') as plantas_recomendadas
      FROM usuarios_app u
      CROSS JOIN (
        SELECT p2.id_planta, p2.nombre_comun,
          (COUNT(DISTINCT f2.id_favorito) * 3 + COUNT(DISTINCT c2.id_consulta) * 2 + COUNT(DISTINCT n2.id_nota) * 4) as puntuacion
        FROM plantas p2
        LEFT JOIN favoritos f2 ON p2.id_planta = f2.id_planta
        LEFT JOIN consultas c2 ON p2.id_planta = c2.id_planta
        LEFT JOIN notas_personales n2 ON p2.id_planta = n2.id_planta
        GROUP BY p2.id_planta
      ) p
      LEFT JOIN favoritos f ON u.id_usuario = f.id_usuario AND f.id_planta = p.id_planta
      GROUP BY u.id_usuario
      LIMIT 5
    `);
    
    const procesadas = recomendaciones.map(r => ({
      id_usuario: r.id_usuario,
      nombre_usuario: r.nombre_usuario,
      plantas_recomendadas: r.plantas_recomendadas ? r.plantas_recomendadas.split(',') : []
    }));
    
    res.json({
      success: true,
      topRecomendaciones: topRecomendaciones.map(p => ({ planta: p.nombre_comun, puntuacion: p.puntuacion, motivo: 'Alta interacción' })),
      recomendaciones: procesadas
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { predecirFallas, recomendarPlantas };