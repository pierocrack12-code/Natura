import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

function EditarPlantaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre_comun: '',
    nombre_cientifico: '',
    descripcion: '',
    propiedades: '',
    usos_tradicionales: '',
    advertencias: '',
    url_foto: '',
    etiqueta_ia: ''
  });

  useEffect(() => {
    cargarPlanta();
  }, [id]);

  const cargarPlanta = async () => {
    try {
      const response = await api.get(`/plantas/${id}`);
      if (response.data.success) {
        setFormData(response.data.planta);
      }
    } catch (error) {
      toast.error('Error al cargar la planta');
      navigate('/plantas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await api.put(`/plantas/${id}`, formData);
      if (response.data.success) {
        toast.success('Planta actualizada exitosamente');
        navigate('/plantas');
      }
    } catch (error) {
      toast.error('Error al actualizar la planta');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Editar Planta</h2>
        <Button variant="secondary" onClick={() => navigate('/plantas')}>
          <FaArrowLeft className="me-2" /> Volver
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Nombre Común *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre_comun"
                    value={formData.nombre_comun}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Nombre Científico</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre_cientifico"
                    value={formData.nombre_cientifico || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Etiqueta IA</Form.Label>
                  <Form.Control
                    type="text"
                    name="etiqueta_ia"
                    value={formData.etiqueta_ia}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">URL de la Foto</Form.Label>
                  <Form.Control
                    type="url"
                    name="url_foto"
                    value={formData.url_foto || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-bold">Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={formData.descripcion || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Propiedades</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="propiedades"
                    value={formData.propiedades || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Usos Tradicionales</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="usos_tradicionales"
                    value={formData.usos_tradicionales || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-bold">Advertencias</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="advertencias"
                    value={formData.advertencias || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <div className="d-flex gap-3 justify-content-end">
                  <Button variant="danger" onClick={() => navigate('/plantas')}>
                    <FaTrash className="me-2" /> Cancelar
                  </Button>
                  <Button variant="success" type="submit" disabled={saving}>
                    <FaSave className="me-2" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default EditarPlantaPage;