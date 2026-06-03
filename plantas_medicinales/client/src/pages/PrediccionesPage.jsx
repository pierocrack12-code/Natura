import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { FaChartLine } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function PrediccionesPage() {
  const [loading, setLoading] = useState(true);
  const [tendencias, setTendencias] = useState([]);

  useEffect(() => {
    cargarTendencias();
  }, []);

  const cargarTendencias = async () => {
    try {
      const response = await api.get('/ml/tendencias');
      if (response.data.success) {
        setTendencias(response.data.tendencias);
      }
    } catch (error) {
      console.error('Error:', error);
      // Datos de ejemplo
      setTendencias([
        { planta: 'Manzanilla', porcentaje: 25, prediccion: 'Alta demanda en los próximos días' },
        { planta: 'Menta', porcentaje: 18, prediccion: 'Incremento constante' },
        { planta: 'Sábila', porcentaje: 5, prediccion: 'Mantendrá popularidad' },
        { planta: 'Romero', porcentaje: 12, prediccion: 'Tendencia al alza' },
        { planta: 'Hierba Luisa', porcentaje: -8, prediccion: 'Disminución temporal' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Datos para el gráfico de tendencias
  const tendenciasChartData = {
    labels: tendencias.map(t => t.planta),
    datasets: [
      {
        label: 'Predicción de crecimiento (%)',
        data: tendencias.map(t => t.porcentaje),
        backgroundColor: tendencias.map(t => t.porcentaje > 0 ? 'rgba(76, 175, 80, 0.7)' : 'rgba(244, 67, 54, 0.7)'),
        borderRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { callbacks: { label: (context) => `${context.raw}% de crecimiento` } }
    },
    scales: {
      y: { title: { display: true, text: 'Porcentaje de crecimiento (%)' }, ticks: { callback: (value) => value + '%' } }
    }
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="success" size="lg" /><p className="mt-3">Cargando predicciones...</p></div>;
  }

  return (
    <div>
      <h2 className="fw-bold mb-4">Panel de Predicciones IA</h2>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white fw-bold">
          <FaChartLine className="me-2 text-success" /> Predicción de Tendencias - ¿Qué plantas van a subir?
        </Card.Header>
        <Card.Body>
          <div style={{ height: '400px' }}>
            <Bar data={tendenciasChartData} options={chartOptions} />
          </div>
          
          <div className="mt-4">
            <h6 className="mb-3">Detalle por planta:</h6>
            <Row className="g-2">
              {tendencias.map((t, i) => (
                <Col md={4} key={i}>
                  <div className="border rounded p-2 mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span><strong>{t.planta}</strong></span>
                      <Badge bg={t.porcentaje > 0 ? 'success' : 'danger'}>
                        {t.porcentaje > 0 ? '+' : ''}{t.porcentaje}%
                      </Badge>
                    </div>
                    <small className="text-muted">{t.prediccion}</small>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default PrediccionesPage;