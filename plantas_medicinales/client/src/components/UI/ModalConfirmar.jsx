import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';

function ModalConfirmar({ show, onHide, onConfirm, titulo, mensaje, loading }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <FaExclamationTriangle className="text-warning" />
          {titulo || 'Confirmar acción'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body><p>{mensaje || '¿Estás seguro de realizar esta acción?'}</p></Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}><FaTrash className="me-1" /> {loading ? 'Eliminando...' : 'Eliminar'}</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalConfirmar;