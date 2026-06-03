import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Button } from 'react-bootstrap';
import { FaChartLine, FaDownload, FaCalendarAlt, FaLeaf, FaBrain } from 'react-icons/fa';
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
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function EstadisticasPage() {
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    totalConsultas: 0,
    consultasHoy: 0,
    consultasMes: 0,
    precisionPromedio: 0
  });
  const [topPlantas, setTopPlantas] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const resEstadisticas = await api.get('/estadisticas/resumen');
      if (resEstadisticas.data.success) {
        setEstadisticas(resEstadisticas.data.estadisticas);
      }
      
      const resTop = await api.get('/estadisticas/top-plantas');
      if (resTop.data.success) {
        setTopPlantas(resTop.data.topPlantas);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const barChartData = {
    labels: topPlantas.map(item => item.nombre_comun),
    datasets: [
      {
        label: 'Número de consultas',
        data: topPlantas.map(item => item.total_consultas),
        backgroundColor: 'rgba(46, 125, 50, 0.7)',
        borderRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { backgroundColor: '#2E7D32' }
    }
  };

  const exportarExcel = () => {
    const exportData = topPlantas.map((p, i) => ({
      Posición: i + 1,
      Planta: p.nombre_comun,
      Consultas: p.total_consultas
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Top Plantas');
    XLSX.writeFile(wb, `estadisticas_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Reporte exportado');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" size="lg" />
        <p className="mt-3">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Panel de Estadísticas</h2>
        <Button variant="success" onClick={exportarExcel}>
          <FaDownload className="me-2" /> Exportar
        </Button>
      </div>

      {/* Tarjetas de resumen */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center p-3">
            <FaChartLine size={30} className="text-success mb-2" />
            <h5>Total Consultas</h5>
            <h2 className="fw-bold">{estadisticas.totalConsultas}</h2>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center p-3">
            <FaCalendarAlt size={30} className="text-primary mb-2" />
            <h5>Consultas Hoy</h5>
            <h2 className="fw-bold">{estadisticas.consultasHoy}</h2>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center p-3">
            <FaBrain size={30} className="text-warning mb-2" />
            <h5>Consultas Este Mes</h5>
            <h2 className="fw-bold">{estadisticas.consultasMes}</h2>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center p-3">
            <FaLeaf size={30} className="text-info mb-2" />
            <h5>Precisión IA</h5>
            <h2 className="fw-bold">{estadisticas.precisionPromedio}%</h2>
          </Card>
        </Col>
      </Row>

      {/* Solo Top Plantas */}
      <Row className="g-4">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white fw-bold">Plantas más consultadas</Card.Header>
            <Card.Body style={{ height: '400px' }}>
              {topPlantas.length > 0 ? (
                <Bar data={barChartData} options={chartOptions} />
              ) : (
                <div className="text-center py-5 text-muted">No hay datos suficientes</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default EstadisticasPage;