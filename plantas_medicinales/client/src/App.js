import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlantasPage from './pages/PlantasPage';
import NuevaPlantaPage from './pages/NuevaPlantaPage';
import EditarPlantaPage from './pages/EditarPlantaPage';
import EstadisticasPage from './pages/EstadisticasPage';
import PrediccionesPage from './pages/PrediccionesPage';
import UsuariosPage from './pages/UsuariosPage';
import PerfilPage from './pages/PerfilPage';
import AdminsPage from './pages/AdminsPage';
import LayoutPrincipal from './components/Layout/LayoutPrincipal';

const PrivateRoute = ({ children }) => {
  const admin = localStorage.getItem('admin');
  return admin ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><LayoutPrincipal /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="plantas" element={<PlantasPage />} />
            <Route path="plantas/nueva" element={<NuevaPlantaPage />} />
            <Route path="plantas/editar/:id" element={<EditarPlantaPage />} />
            <Route path="estadisticas" element={<EstadisticasPage />} />
            <Route path="predicciones" element={<PrediccionesPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="perfil" element={<PerfilPage />} />
            <Route path="admins" element={<AdminsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;