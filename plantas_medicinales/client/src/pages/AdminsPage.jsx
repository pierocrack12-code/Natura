import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Form, Modal, Badge, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaKey, FaUserShield } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });

  useEffect(() => { cargarAdmins(); }, []);

  const cargarAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/admins');
      if (response.data.success) setAdmins(response.data.admins);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) await api.put(`/auth/admins/${editingAdmin.id_admin}`, { nombre: formData.nombre, email: formData.email });
      else await api.post('/auth/admins', { nombre: formData.nombre, email: formData.email, password: formData.password });
      toast.success(editingAdmin ? 'Actualizado' : 'Creado');
      setShowModal(false);
      cargarAdmins();
      setFormData({ nombre: '', email: '', password: '' });
    } catch (error) { toast.error('Error al guardar'); }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Eliminar a ${nombre}?`)) {
      try { await api.delete(`/auth/admins/${id}`); toast.success('Eliminado'); cargarAdmins(); } 
      catch (error) { toast.error('Error'); }
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 3) return toast.error('Mínimo 3 caracteres');
    try { await api.put(`/auth/admins/${selectedAdmin.id_admin}/password`, { nueva_password: newPassword }); toast.success('Contraseña actualizada'); setShowPasswordModal(false); setNewPassword(''); } 
    catch (error) { toast.error('Error'); }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <div><div className="d-flex justify-content-between mb-4"><h2 className="fw-bold"><FaUserShield className="me-2" /> Administradores</h2><Button variant="success" onClick={() => setShowModal(true)}><FaPlus className="me-1" /> Nuevo Admin</Button></div>
      <Card className="border-0 shadow-sm"><Card.Body><Table hover responsive><thead className="bg-light"><tr><th>#</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>{admins.map((admin, idx) => (<tr key={admin.id_admin}><td>{idx + 1}</td><td>{admin.nombre}</td><td>{admin.email}</td><td><Badge bg={admin.rol === 'super_admin' ? 'warning' : 'info'}>{admin.rol}</Badge></td><td><Badge bg={admin.activo ? 'success' : 'danger'}>{admin.activo ? 'Activo' : 'Inactivo'}</Badge></td>
        <td><div className="d-flex gap-2"><Button size="sm" variant="outline-primary" onClick={() => { setEditingAdmin(admin); setFormData({ nombre: admin.nombre, email: admin.email }); setShowModal(true); }}><FaEdit /></Button>
        <Button size="sm" variant="outline-warning" onClick={() => { setSelectedAdmin(admin); setShowPasswordModal(true); }}><FaKey /></Button>
        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(admin.id_admin, admin.nombre)} disabled={admin.rol === 'super_admin'}><FaTrash /></Button></div></td></tr>))}</tbody></Table></Card.Body></Card>

      <Modal show={showModal} onHide={() => { setShowModal(false); setEditingAdmin(null); }}><Modal.Header closeButton><Modal.Title>{editingAdmin ? 'Editar Admin' : 'Nuevo Admin'}</Modal.Title></Modal.Header>
        <Modal.Body><Form onSubmit={handleSubmit}><Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required /></Form.Group>
        <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></Form.Group>
        {!editingAdmin && <Form.Group className="mb-3"><Form.Label>Contraseña</Form.Label><Form.Control type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required /></Form.Group>}
        <Button type="submit" variant="success">{editingAdmin ? 'Actualizar' : 'Crear'}</Button></Form></Modal.Body></Modal>

      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}><Modal.Header closeButton><Modal.Title>Cambiar Contraseña</Modal.Title></Modal.Header><Modal.Body><Form.Group><Form.Label>Nueva Contraseña</Form.Label><Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 3 caracteres" /></Form.Group></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Cancelar</Button><Button variant="success" onClick={handleChangePassword}>Guardar</Button></Modal.Footer></Modal>
    </div>
  );
}

export default AdminsPage;