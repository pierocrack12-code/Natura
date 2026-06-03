import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { FaLeaf, FaCalendar, FaChartLine, FaBrain } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function Dashboard() {
  const [estadisticas, setEstadisticas] = useState({ totalConsultas: 0, consultasHoy: 0, consultasMes: 0, precisionPromedio: 0 });
  const [consultasPorFecha, setConsultasPorFecha] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resEstadisticas, resConsultas] = await Promise.all([
        api.get('/estadisticas/resumen'),
        api.get('/estadisticas/consultas-por-dia')
      ]);
      if (resEstadisticas.data.success) setEstadisticas(resEstadisticas.data.estadisticas);
      if (resConsultas.data.success) {
        // Formatear fechas a dd/mm/yyyy
        const fechasFormateadas = resConsultas.data.consultas.map(item => {
          const fecha = new Date(item.fecha);
          const dia = fecha.getDate().toString().padStart(2, '0');
          const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
          const anio = fecha.getFullYear();
          return `${dia}/${mes}/${anio}`;
        });
        setConsultasPorFecha({
          fechas: fechasFormateadas,
          datos: resConsultas.data.consultas.map(item => item.total)
        });
      }
    } catch (error) {
      console.error(error);
      // Datos de ejemplo con fechas formateadas
      setConsultasPorFecha({
        fechas: ['22/05/2025', '23/05/2025', '24/05/2025', '25/05/2025', '26/05/2025', '27/05/2025', '28/05/2025'],
        datos: [5, 8, 12, 7, 15, 10, 6]
      });
    } finally {
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: consultasPorFecha.fechas || [],
    datasets: [
      {
        label: 'Consultas por día',
        data: consultasPorFecha.datos || [],
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#fff',
        pointRadius: 5,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { backgroundColor: '#2E7D32' }
    },
    scales: {
      x: { title: { display: true, text: 'Fecha' } },
      y: { title: { display: true, text: 'Número de consultas' }, ticks: { stepSize: 1 } }
    }
  };

  const tarjetas = [
    { titulo: 'Total Consultas', valor: estadisticas.totalConsultas, icono: <FaLeaf className="text-success fs-1" />, color: 'success' },
    { titulo: 'Consultas Hoy', valor: estadisticas.consultasHoy, icono: <FaCalendar className="text-primary fs-1" />, color: 'primary' },
    { titulo: 'Consultas Este Mes', valor: estadisticas.consultasMes, icono: <FaChartLine className="text-info fs-1" />, color: 'info' },
    { titulo: 'Precisión IA', valor: `${estadisticas.precisionPromedio}%`, icono: <FaBrain className="text-warning fs-1" />, color: 'warning' }
  ];

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-2">Cargando dashboard...</p></div>;
  }

  return (
    <div>
      <h2 className="fw-bold mb-4">Dashboard</h2>
      
      <Row className="g-4 mb-4">
        {tarjetas.map((t, i) => (
          <Col key={i} xs={12} sm={6} lg={3}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div><h6 className="text-muted mb-2">{t.titulo}</h6><h3 className="fw-bold mb-0">{t.valor}</h3></div>
                  <div className={`text-${t.color} bg-${t.color} bg-opacity-10 rounded-circle p-3`}>{t.icono}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white fw-bold">📈 Historial de Consultas (últimos 7 días)</Card.Header>
        <Card.Body style={{ height: '400px' }}>
          {consultasPorFecha.fechas && consultasPorFecha.fechas.length > 0 ? (
            <Line data={lineChartData} options={chartOptions} />
          ) : (
            <div className="text-center py-5 text-muted">No hay datos de consultas</div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default Dashboard;