import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { FaLeaf, FaTachometerAlt, FaChartBar, FaSignOutAlt, FaUser, FaUsers, FaBrain } from 'react-icons/fa';

function LayoutPrincipal() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <Navbar bg="success" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand href="#" className="d-flex align-items-center gap-2">
            <FaLeaf size={24} />
            <span className="fw-bold">Admin Plantas</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => navigate('/dashboard')}><FaTachometerAlt className="me-1" /> Dashboard</Nav.Link>
              <Nav.Link onClick={() => navigate('/plantas')}><FaLeaf className="me-1" /> Plantas</Nav.Link>
              <Nav.Link onClick={() => navigate('/estadisticas')}><FaChartBar className="me-1" /> Estadísticas</Nav.Link>
              <Nav.Link onClick={() => navigate('/predicciones')}><FaBrain className="me-1" /> Predicciones IA</Nav.Link>
              <Nav.Link onClick={() => navigate('/usuarios')}><FaUsers className="me-1" /> Usuarios App</Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown title={<span><FaUser className="me-1" />{user?.nombre || 'Admin'}</span>} align="end">
                <NavDropdown.Item onClick={() => navigate('/perfil')}><FaUser className="me-2" /> Mi Perfil</NavDropdown.Item>
                <NavDropdown.Item onClick={() => navigate('/admins')}><FaUsers className="me-2" /> Administradores</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}><FaSignOutAlt className="me-2" /> Cerrar Sesión</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid className="p-4"><Outlet /></Container>
    </div>
  );
}

export default LayoutPrincipal;