import React, { useEffect, useState } from 'react';
import { getTypes, addType, deleteType } from '../../api/materiel';
import { Container, Row, Col, Form, Button, Table, Alert, Spinner, Nav } from 'react-bootstrap';
import PaginationControl from '../../components/PaginationControl';
import { Link } from 'react-router-dom';

const TypeList = () => {
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchTypes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTypes();
      setTypes(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors du chargement des types");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = types.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(types.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // reset page when itemsPerPage changes
  }, [itemsPerPage]);

  const handleAddType = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newType.trim()) return;
    try {
      await addType(newType);
      setNewType('');
      setSuccess('Type ajouté avec succès');
      fetchTypes();
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de l'ajout du type");
    }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm('Supprimer ce type ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await deleteType(id);
      setSuccess('Type supprimé avec succès');
      fetchTypes();
    } catch (e) {
      if (e.response?.status === 500) {
        setError("Impossible de supprimer ce type car il est utilisé par des marques, modèles ou matériels.");
      } else {
        setError(e.response?.data?.message || "Erreur lors de la suppression du type");
      }
    }
    setLoading(false);
  };

  const handleSelectType = (id) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTypes.length === types.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(types.map(t => t.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTypes.length === 0) return;
    if (!window.confirm('Supprimer tous les types sélectionnés ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    let hasError = false;
    for (const id of selectedTypes) {
      try {
        await deleteType(id);
      } catch (e) {
        hasError = true;
      }
    }
    if (hasError) {
      setError("Certains types n'ont pas pu être supprimés car ils sont utilisés.");
    } else {
      setSuccess('Types supprimés avec succès');
    }
    setSelectedTypes([]);
    fetchTypes();
    setLoading(false);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Gestion des Types de Matériel</h2>
      <Nav variant="tabs" className="mb-3">
        <Nav.Item><Nav.Link as={Link} to="/types" active>Types</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/marques">Marques</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/modeles">Modèles</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/materiels">Matériels</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/ajouter-materiel">Ajouter Matériel</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/affectations">Affecter</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/affectations-liste">Affectations (liste)</Nav.Link></Nav.Item>
      </Nav>
      <Form onSubmit={handleAddType} className="mb-4 p-3 border rounded bg-white shadow-sm">
        <Row className="align-items-center g-2">
          <Col xs={12} md={8} className="mb-2 mb-md-0">
            <Form.Control
              type="text"
              value={newType}
              onChange={e => setNewType(e.target.value)}
              placeholder="Nouveau type"
              required
            />
          </Col>
          <Col xs={12} md={4}>
            <Button type="submit" variant="primary" className="w-100">Ajouter</Button>
          </Col>
        </Row>
      </Form>
      {success && <Alert variant="success">{success}</Alert>}
      {loading ? (
        <div className="text-center my-4"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger" className="text-center">{error}</Alert>
      ) : (
        <>
          <div className="mb-2">
            <Button variant="danger" size="sm" disabled={selectedTypes.length === 0} onClick={handleDeleteSelected}>
              Supprimer la sélection
            </Button>
          </div>
          <div className="table-responsive">
            <Table bordered hover className="bg-white shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={selectedTypes.length === types.length && types.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">Aucun type trouvé.</td>
                  </tr>
                ) : (
                  currentItems.map(type => (
                    <tr key={type.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedTypes.includes(type.id)}
                          onChange={() => handleSelectType(type.id)}
                        />
                      </td>
                      <td>{type.id}</td>
                      <td>{type.nom}</td>
                      <td>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteType(type.id)}>
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
            />
          </div>
        </>
      )}
    </Container>
  );
};

export default TypeList; 