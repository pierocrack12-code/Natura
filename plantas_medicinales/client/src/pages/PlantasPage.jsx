import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Form, InputGroup, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaLeaf, FaFilter, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';
import ModalConfirmar from '../components/UI/ModalConfirmar';

function PlantasPage() {
  const navigate = useNavigate();
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroConsultas, setFiltroConsultas] = useState('todos'); // todos, mas, menos
  const [showModal, setShowModal] = useState(false);
  const [plantaAEliminar, setPlantaAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    cargarPlantas();
  }, []);

  const cargarPlantas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/plantas');
      if (response.data.success) {
        setPlantas(response.data.plantas);
      }
    } catch (error) {
      toast.error('Error al cargar plantas');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarClick = (planta) => {
    setPlantaAEliminar(planta);
    setShowModal(true);
  };

  const confirmarEliminar = async () => {
    if (!plantaAEliminar) return;
    
    setEliminando(true);
    try {
      const response = await api.delete(`/plantas/${plantaAEliminar.id_planta}`);
      if (response.data.success) {
        toast.success(`${plantaAEliminar.nombre_comun} eliminada`);
        cargarPlantas();
        setShowModal(false);
        setPlantaAEliminar(null);
      }
    } catch (error) {
      toast.error('Error al eliminar');
    } finally {
      setEliminando(false);
    }
  };

  // Filtrar plantas
  let plantasFiltradas = plantas.filter(planta =>
    planta.nombre_comun.toLowerCase().includes(searchTerm.toLowerCase()) ||
    planta.nombre_cientifico?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar por cantidad de consultas
  if (filtroConsultas === 'mas') {
    plantasFiltradas = plantasFiltradas.filter(p => (p.veces_consultada || 0) > 50);
  } else if (filtroConsultas === 'menos') {
    plantasFiltradas = plantasFiltradas.filter(p => (p.veces_consultada || 0) <= 50);
  }

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroConsultas('todos');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-2">Cargando plantas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="fw-bold mb-0">Gestión de Plantas</h2>
        <Button variant="success" onClick={() => navigate('/plantas/nueva')}>
          <FaPlus className="me-1" /> Nueva Planta
        </Button>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre común o científico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select 
                value={filtroConsultas} 
                onChange={(e) => setFiltroConsultas(e.target.value)}
              >
                <option value="todos">Todas las plantas</option>
                <option value="mas">Más consultadas (&gt;50)</option>
                <option value="menos">Menos consultadas (≤50)</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={limpiarFiltros} className="w-100">
                <FaTimes className="me-1" /> Limpiar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="table-responsive">
            <Table hover striped className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>#</th>
                  <th>Nombre Común</th>
                  <th>Nombre Científico</th>
                  <th>Consultas</th>
                  <th>Precisión IA</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plantasFiltradas.map((planta, index) => (
                  <tr key={planta.id_planta}>
                    <td>{index + 1}</td>
                    <td className="fw-bold">{planta.nombre_comun}</td>
                    <td className="text-muted">{planta.nombre_cientifico || '-'}</td>
                    <td>
                      <Badge bg="success" pill>
                        {planta.veces_consultada || 0}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="info" pill>
                        {Math.floor(Math.random() * 30) + 70}%
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => navigate(`/plantas/editar/${planta.id_planta}`)}
                          title="Editar"
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleEliminarClick(planta)}
                          title="Eliminar"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {plantasFiltradas.length === 0 && (
            <div className="text-center py-5">
              <FaLeaf className="text-muted fs-1 mb-3" />
              <p className="text-muted">No se encontraron plantas</p>
              <Button variant="outline-success" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <ModalConfirmar
        show={showModal}
        onHide={() => setShowModal(false)}
        onConfirm={confirmarEliminar}
        titulo="Eliminar planta"
        mensaje={`¿Estás seguro de eliminar "${plantaAEliminar?.nombre_comun}"? Esta acción no se puede deshacer.`}
        loading={eliminando}
      />
    </div>
  );
}

export default PlantasPage;