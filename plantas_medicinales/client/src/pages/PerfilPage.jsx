import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaUser, FaSave, FaKey } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function PerfilPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ nombre: '', email: '' });
  const [passwordData, setPasswordData] = useState({ nueva: '', confirmar: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setFormData({ nombre: user.nombre || '', email: user.email || '' });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { toast.success('Perfil actualizado'); setLoading(false); }, 1000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.nueva !== passwordData.confirmar) return toast.error('Las contraseñas no coinciden');
    if (passwordData.nueva.length < 3) return toast.error('Mínimo 3 caracteres');
    setLoading(true);
    setTimeout(() => { toast.success('Contraseña actualizada'); setPasswordData({ nueva: '', confirmar: '' }); setLoading(false); }, 1000);
  };

  return (
    <div><h2 className="fw-bold mb-4">Mi Perfil</h2>
      <Row className="g-4">
        <Col lg={6}><Card className="border-0 shadow-sm"><Card.Header className="bg-white fw-bold"><FaUser className="me-2" /> Información Personal</Card.Header>
          <Card.Body><Form onSubmit={handleSubmit}><Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></Form.Group>
          <Button type="submit" variant="success" disabled={loading}><FaSave className="me-1" /> Actualizar Perfil</Button></Form></Card.Body></Card></Col>
        <Col lg={6}><Card className="border-0 shadow-sm"><Card.Header className="bg-white fw-bold"><FaKey className="me-2" /> Cambiar Contraseña</Card.Header>
          <Card.Body><Form onSubmit={handlePasswordChange}><Form.Group className="mb-3"><Form.Label>Nueva Contraseña</Form.Label><Form.Control type="password" value={passwordData.nueva} onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })} required /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Confirmar Contraseña</Form.Label><Form.Control type="password" value={passwordData.confirmar} onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })} required /></Form.Group>
          <Alert variant="info" className="small">La contraseña debe tener al menos 3 caracteres</Alert>
          <Button type="submit" variant="warning" disabled={loading}><FaSave className="me-1" /> Cambiar Contraseña</Button></Form></Card.Body></Card></Col>
      </Row>
    </div>
  );
}

export default PerfilPage;