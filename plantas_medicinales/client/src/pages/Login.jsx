import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaLeaf, FaEnvelope, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('¡Bienvenido Administrador!');
      navigate('/dashboard');
    } catch (error) { toast.error('Credenciales incorrectas'); } 
    finally { setLoading(false); }
  };

  return (
    <div className="bg-success min-vh-100 d-flex align-items-center">
      <Container><Row className="justify-content-center"><Col md={5}>
        <Card className="shadow-lg border-0 rounded-4"><Card.Body className="p-5">
          <div className="text-center mb-4"><div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3"><FaLeaf className="text-success fs-1" /></div><h2 className="fw-bold">Admin Plantas</h2><p className="text-muted">Panel de administración</p></div>
          <Form onSubmit={handleSubmit}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><div className="input-group"><span className="input-group-text"><FaEnvelope /></span><Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@plantas.com" required /></div></Form.Group>
          <Form.Group className="mb-4"><Form.Label>Contraseña</Form.Label><div className="input-group"><span className="input-group-text"><FaLock /></span><Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="*****" required /></div></Form.Group>
          <Button type="submit" variant="success" className="w-100 py-2" disabled={loading}>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</Button></Form>
          <div className="text-center mt-4"><small className="text-muted"></small></div>
        </Card.Body></Card>
      </Col></Row></Container>
    </div>
  );
}

export default Login;