import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Spinner, Badge, Modal, Row, Col } from 'react-bootstrap';
import { FaUsers, FaSearch, FaEye, FaHistory, FaHeart, FaBan, FaCheck, FaSync, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      if (response.data.success) {
        setUsuarios(response.data.usuarios);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar usuarios');
      setUsuarios([
        { id_usuario: 1, nombre_completo: 'María García', email: 'maria@gmail.com', telefono: '987654321', fecha_registro: '2024-01-15', ultimo_acceso: '2024-01-20', activo: 1, total_consultas: 10 },
        { id_usuario: 2, nombre_completo: 'Carlos López', email: 'carlos@gmail.com', telefono: '987654322', fecha_registro: '2024-01-16', ultimo_acceso: '2024-01-19', activo: 1, total_consultas: 8 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const verDetalleUsuario = async (usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowModal(true);
    setLoadingDetalle(true);
    try {
      const [resHistorial, resFavoritos] = await Promise.all([
        api.get(`/usuarios/${usuario.id_usuario}/historial`).catch(() => ({ data: { historial: [] } })),
        api.get(`/usuarios/${usuario.id_usuario}/favoritos`).catch(() => ({ data: { favoritos: [] } }))
      ]);
      setHistorial(resHistorial.data.historial || []);
      setFavoritos(resFavoritos.data.favoritos || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const toggleEstadoUsuario = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual;
    if (window.confirm(`¿${nuevoEstado ? 'Activar' : 'Desactivar'} este usuario?`)) {
      try {
        await api.put(`/usuarios/${id}/estado`, { activo: nuevoEstado });
        toast.success(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'}`);
        cargarUsuarios();
      } catch (error) {
        toast.error('Error al cambiar estado');
      }
    }
  };

  const eliminarUsuario = async (id, nombre) => {
    if (window.confirm(`¿Eliminar permanentemente a "${nombre}"?`)) {
      try {
        await api.delete(`/usuarios/${id}`);
        toast.success('Usuario eliminado');
        cargarUsuarios();
        if (showModal) setShowModal(false);
      } catch (error) {
        toast.error('Error al eliminar usuario');
      }
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-2">Cargando usuarios...</p></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold"><FaUsers className="me-2 text-success" /> Usuarios de la App Móvil</h2>
        <Button variant="outline-secondary" onClick={cargarUsuarios} size="sm"><FaSync className="me-1" /> Actualizar</Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="mb-4">
            <InputGroup>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control type="text" placeholder="Buscar por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </InputGroup>
          </div>
          <div className="table-responsive">
            <Table hover striped className="align-middle">
              <thead className="bg-light">
                <tr><th>#</th><th>Usuario</th><th>Email</th><th>Teléfono</th><th>Consultas</th><th>Registro</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario, index) => (
                  <tr key={usuario.id_usuario}>
                    <td>{index + 1}</td>
                    <td className="fw-bold">{usuario.nombre_completo}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.telefono || '-'}</td>
                    <td><Badge bg="info" pill>{usuario.total_consultas || 0}</Badge></td>
                    <td className="text-muted small">{usuario.fecha_registro?.split('T')[0]}</td>
                    <td><Badge bg={usuario.activo ? 'success' : 'danger'}>{usuario.activo ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-info" onClick={() => verDetalleUsuario(usuario)} title="Ver detalles"><FaEye /></Button>
                        <Button size="sm" variant={usuario.activo ? 'outline-warning' : 'outline-success'} onClick={() => toggleEstadoUsuario(usuario.id_usuario, usuario.activo)} title={usuario.activo ? 'Desactivar' : 'Activar'}>{usuario.activo ? <FaBan /> : <FaCheck />}</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => eliminarUsuario(usuario.id_usuario, usuario.nombre_completo)} title="Eliminar"><FaTrash /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title><FaUsers className="me-2 text-success" /> {usuarioSeleccionado?.nombre_completo}</Modal.Title></Modal.Header>
        <Modal.Body>
          {loadingDetalle ? <div className="text-center py-4"><Spinner animation="border" variant="success" /></div> : (
            <>
              <Row className="mb-4">
                <Col md={6}><Card className="bg-light"><Card.Body><small className="text-muted">Email</small><p><strong>{usuarioSeleccionado?.email}</strong></p><small className="text-muted">Teléfono</small><p><strong>{usuarioSeleccionado?.telefono || 'No registrado'}</strong></p></Card.Body></Card></Col>
                <Col md={6}><Card className="bg-light"><Card.Body><small className="text-muted">Registro</small><p><strong>{usuarioSeleccionado?.fecha_registro}</strong></p><small className="text-muted">Último acceso</small><p><strong>{usuarioSeleccionado?.ultimo_acceso || 'Nunca'}</strong></p></Card.Body></Card></Col>
              </Row>
              <h6><FaHistory className="me-2" /> Historial ({historial.length})</h6>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {historial.length > 0 ? (
                  <Table size="sm" hover><thead><tr><th>Planta</th><th>Confianza</th><th>Fecha</th></tr></thead>
                  <tbody>{historial.map((item, idx) => (<tr key={idx}><td>{item.planta}</td><td><Badge bg="success">{item.confianza}%</Badge></td><td>{item.fecha}</td></tr>))}</tbody></Table>
                ) : <p className="text-muted text-center py-2">No hay consultas</p>}
              </div>
              <h6 className="mt-3"><FaHeart className="me-2 text-danger" /> Favoritos ({favoritos.length})</h6>
              <div>{favoritos.map((item, idx) => (<Badge key={idx} bg="danger" className="m-1 p-2">{item.nombre_comun}</Badge>))}</div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button></Modal.Footer>
      </Modal>
    </div>
  );
}

export default UsuariosPage;