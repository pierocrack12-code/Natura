import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaUpload, FaLeaf } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

function NuevaPlantaPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  // Agregar al inicio del componente:
const [imagenPreview, setImagenPreview] = useState('');
const [subiendoImagen, setSubiendoImagen] = useState(false);

// Agregar función para subir imagen:
const subirImagen = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('imagen', file);
  setSubiendoImagen(true);
  
  try {
    const response = await api.post('/upload/imagen', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (response.data.success) {
      setFormData({ ...formData, url_foto: response.data.imagenUrl });
      setImagenPreview(response.data.imagenUrl);
      toast.success('Imagen subida');
    }
  } catch (error) {
    toast.error('Error al subir imagen');
  } finally {
    setSubiendoImagen(false);
  }
};

// Agregar en el formulario, después del campo URL:
<Form.Group>
  <Form.Label>Subir Imagen</Form.Label>
  <Form.Control
    type="file"
    accept="image/*"
    onChange={subirImagen}
    disabled={subiendoImagen}
  />
  {imagenPreview && (
    <div className="mt-2">
      <img src={imagenPreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} className="rounded" />
    </div>
  )}
</Form.Group>

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/plantas', formData);
      if (response.data.success) {
        toast.success('Planta creada exitosamente');
        navigate('/plantas');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear la planta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Nueva Planta Medicinal</h2>
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
                    placeholder="Ej: Manzanilla"
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
                    value={formData.nombre_cientifico}
                    onChange={handleChange}
                    placeholder="Ej: Matricaria chamomilla"
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
                    placeholder="Ej: manzanilla (como la reconoce TensorFlow)"
                    required
                  />
                  <Form.Text className="text-muted">
                    Nombre que devuelve el modelo de Machine Learning
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">URL de la Foto</Form.Label>
                  <Form.Control
                    type="url"
                    name="url_foto"
                    value={formData.url_foto}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/foto.jpg"
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
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Describe las características de la planta..."
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
                    value={formData.propiedades}
                    onChange={handleChange}
                    placeholder="Ej: Antiinflamatoria, calmante, digestiva..."
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
                    value={formData.usos_tradicionales}
                    onChange={handleChange}
                    placeholder="Ej: Té para cólicos, ansiedad e insomnio..."
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
                    value={formData.advertencias}
                    onChange={handleChange}
                    placeholder="Ej: Evitar en embarazo, no consumir en exceso..."
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Alert variant="info" className="mt-2">
                  <FaLeaf className="me-2" />
                  La etiqueta IA debe coincidir con el nombre que el modelo TensorFlow
                  devuelve al reconocer la planta.
                </Alert>
              </Col>

              <Col xs={12}>
                <div className="d-flex gap-3 justify-content-end">
                  <Button variant="secondary" onClick={() => navigate('/plantas')}>
                    Cancelar
                  </Button>
                  <Button variant="success" type="submit" disabled={loading}>
                    <FaSave className="me-2" />
                    {loading ? 'Guardando...' : 'Guardar Planta'}
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

export default NuevaPlantaPage;