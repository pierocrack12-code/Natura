const pool = require('../config/database');

// Predecir tendencias basado en datos históricos
const predecirTendencias = async () => {
    try {
        // Obtener consultas de los últimos 30 días
        const [consultas] = await pool.query(`
            SELECT 
                p.nombre_comun,
                COUNT(c.id_consulta) as total,
                DATE(c.fecha_consulta) as fecha
            FROM consultas c
            JOIN plantas p ON c.id_planta = p.id_planta
            WHERE c.fecha_consulta >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY p.id_planta, DATE(c.fecha_consulta)
            ORDER BY fecha DESC
        `);
        
        // Analizar tendencias
        const tendencias = {};
        consultas.forEach(c => {
            if (!tendencias[c.nombre_comun]) {
                tendencias[c.nombre_comun] = [];
            }
            tendencias[c.nombre_comun].push(c.total);
        });
        
        // Calcular crecimiento
        const predicciones = [];
        for (const [planta, datos] of Object.entries(tendencias)) {
            if (datos.length >= 7) {
                const ultimaSemana = datos.slice(0, 7);
                const semanaAnterior = datos.slice(7, 14);
                
                const promedioActual = ultimaSemana.reduce((a,b) => a + b, 0) / ultimaSemana.length;
                const promedioAnterior = semanaAnterior.reduce((a,b) => a + b, 0) / semanaAnterior.length;
                
                const crecimiento = ((promedioActual - promedioAnterior) / promedioAnterior) * 100;
                
                predicciones.push({
                    planta: planta,
                    crecimiento: Math.round(crecimiento),
                    tendencia: crecimiento > 10 ? '📈 Al alza' : crecimiento < -10 ? '📉 A la baja' : '➡️ Estable',
                    prediccion: crecimiento > 20 ? 'Alta demanda en próximos días' : 
                               crecimiento < -20 ? 'Disminución de interés' : 
                               'Mantendrá su popularidad'
                });
            }
        }
        
        // Ordenar por crecimiento
        return predicciones.sort((a,b) => b.crecimiento - a.crecimiento).slice(0, 5);
    } catch (error) {
        console.error('Error en predicción:', error);
        return [];
    }
};

// Predecir mejor momento para consultas
const predecirHorariosPico = async () => {
    try {
        const [horarios] = await pool.query(`
            SELECT 
                HOUR(fecha_consulta) as hora,
                COUNT(*) as total
            FROM consultas
            WHERE fecha_consulta >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY HOUR(fecha_consulta)
            ORDER BY total DESC
            LIMIT 3
        `);
        
        return horarios.map(h => ({
            hora: h.hora,
            total: h.total,
            recomendacion: `Optimizar servidor a las ${h.hora}:00 hrs`
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Predecir plantas que necesitan más imágenes
const predecirNecesidadImagenes = async () => {
    try {
        const [plantas] = await pool.query(`
            SELECT 
                p.nombre_comun,
                COUNT(c.id_consulta) as consultas,
                CASE 
                    WHEN COUNT(c.id_consulta) > 100 AND p.url_foto IS NULL THEN 'URGENTE'
                    WHEN COUNT(c.id_consulta) > 50 AND p.url_foto IS NULL THEN 'Importante'
                    WHEN COUNT(c.id_consulta) > 20 THEN 'Recomendado'
                    ELSE 'Bajo prioridad'
                END as prioridad
            FROM plantas p
            LEFT JOIN consultas c ON p.id_planta = c.id_planta
            GROUP BY p.id_planta
            HAVING p.url_foto IS NULL
            ORDER BY consultas DESC
            LIMIT 5
        `);
        
        return plantas;
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Predecir precisión del modelo
const predecirPrecision = async () => {
    try {
        const [precision] = await pool.query(`
            SELECT 
                AVG(confianza_ia) as precision_actual,
                DATE(fecha_consulta) as fecha
            FROM consultas
            WHERE fecha_consulta >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(fecha_consulta)
        `);
        
        const precisionActual = precision[precision.length - 1]?.precision_actual || 85;
        const precisionAnterior = precision[0]?.precision_actual || 85;
        const cambio = (precisionActual - precisionAnterior).toFixed(1);
        
        return {
            precision_actual: Math.round(precisionActual),
            tendencia_precision: cambio > 0 ? 'subiendo' : cambio < 0 ? 'bajando' : 'estable',
            cambio: Math.abs(cambio),
            recomendacion: cambio < -5 ? '⚠️ Necesita reentrenamiento' : 
                          cambio > 5 ? '✅ Mejorando rendimiento' : 
                          '📊 Estable, monitorear'
        };
    } catch (error) {
        console.error(error);
        return {
            precision_actual: 85,
            tendencia_precision: 'estable',
            cambio: 0,
            recomendacion: '📊 Datos insuficientes'
        };
    }
};

module.exports = {
    predecirTendencias,
    predecirHorariosPico,
    predecirNecesidadImagenes,
    predecirPrecision
};