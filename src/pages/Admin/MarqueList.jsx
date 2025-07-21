import React, { useEffect, useState } from 'react';
import { getTypes, getMarques, addMarque, deleteMarque } from '../../api/materiel';
import { Container, Row, Col, Form, Button, Table, Alert, Spinner, Nav } from 'react-bootstrap';
import PaginationControl from '../../components/PaginationControl';
import { Link } from 'react-router-dom';

const MarqueList = () => {
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [marques, setMarques] = useState([]);
  const [newMarque, setNewMarque] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMarques, setSelectedMarques] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');

  useEffect(() => {
    getTypes()
      .then(res => setTypes(res.data))
      .catch(() => setTypes([]));
  }, []);

  useEffect(() => {
    const loadMarques = async () => {
      try {
        const res = await getMarques(selectedTypeFilter);
        setMarques(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError("Erreur lors du chargement des marques");
      }
    };
    loadMarques();
  }, [selectedTypeFilter]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = marques.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(marques.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // reset page when itemsPerPage changes
  }, [itemsPerPage]);

  const handleAddMarque = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newMarque.trim() || selectedTypes.length === 0) {
      setError('Veuillez sélectionner au moins un type et saisir un nom de marque');
      return;
    }

    setLoading(true);
    try {
      console.log('Données envoyées:', {
        nom: newMarque,
        typeIds: selectedTypes
      });
      
      await addMarque(newMarque, selectedTypes);
      setNewMarque('');
      setSelectedTypes([]);
      setSuccess('Marque ajoutée avec succès');
      
      // Recharger toutes les marques
      const res = await getMarques(selectedTypeFilter);
      console.log('Marques reçues après ajout:', res.data);
      setMarques(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Erreur lors de l\'ajout:', e.response?.data || e);
      setError(e.response?.data?.message || "Erreur lors de l'ajout de la marque");
    }
    setLoading(false);
  };

  const handleDeleteMarque = async (id) => {
    if (!window.confirm('Supprimer cette marque ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await deleteMarque(id);
      setSuccess('Marque supprimée avec succès');
      const res = await getMarques(selectedType);
      setMarques(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if (e.response?.status === 500) {
        setError("Impossible de supprimer cette marque car elle est utilisée par des modèles ou matériels.");
      } else {
        setError(e.response?.data?.message || "Erreur lors de la suppression de la marque");
      }
    }
    setLoading(false);
  };

  const handleSelectMarque = (id) => {
    setSelectedMarques(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMarques.length === marques.length) {
      setSelectedMarques([]);
    } else {
      setSelectedMarques(marques.map(m => m.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMarques.length === 0) return;
    if (!window.confirm('Supprimer toutes les marques sélectionnées ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    let hasError = false;
    for (const id of selectedMarques) {
      try {
        await deleteMarque(id);
      } catch (e) {
        hasError = true;
      }
    }
    if (hasError) {
      setError("Certaines marques n'ont pas pu être supprimées car elles sont utilisées.");
    } else {
      setSuccess('Marques supprimées avec succès');
    }
    setSelectedMarques([]);
    const res = await getMarques(selectedType);
    setMarques(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Gestion des Marques</h2>
      <Nav variant="tabs" className="mb-3">
        <Nav.Item><Nav.Link as={Link} to="/types">Types</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/marques" active>Marques</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/modeles">Modèles</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/materiels">Matériels</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/ajouter-materiel">Ajouter Matériel</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/affectations">Affecter</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/affectations-liste">Affectations (liste)</Nav.Link></Nav.Item>
      </Nav>
      <Form className="mb-4 p-3 border rounded bg-white shadow-sm" onSubmit={handleAddMarque}>
        <Row className="align-items-center g-2">
          <Col xs={12} md={4} className="mb-2 mb-md-0">
            <Form.Select multiple value={selectedTypes} onChange={e => setSelectedTypes([...e.target.selectedOptions].map(opt => opt.value))} required>
              {types.map(type => (
                <option key={type.id} value={type.id}>{type.nom}</option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} md={5} className="mb-2 mb-md-0">
            <Form.Control
              type="text"
              value={newMarque}
              onChange={e => setNewMarque(e.target.value)}
              placeholder="Nouvelle marque"
              required
              disabled={types.length === 0}
            />
          </Col>
          <Col xs={12} md={3}>
            <Button type="submit" variant="primary" className="w-100" disabled={selectedTypes.length === 0}>Ajouter</Button>
          </Col>
        </Row>
      </Form>
      <Form.Group className="mb-3">
        <Form.Select 
          value={selectedTypeFilter} 
          onChange={(e) => setSelectedTypeFilter(e.target.value)}
          className="mb-3"
        >
          <option value="">Tous les types</option>
          {types.map(type => (
            <option key={type.id} value={type.id}>{type.nom}</option>
          ))}
        </Form.Select>
      </Form.Group>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center my-4"><Spinner animation="border" /></div>
      ) : (
        <>
          <div className="mb-2">
            <Button variant="danger" size="sm" disabled={selectedMarques.length === 0} onClick={handleDeleteSelected}>
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
                      checked={selectedMarques.length === marques.length && marques.length > 0}
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
                    <td colSpan="4" className="text-center text-muted">Aucune marque trouvée.</td>
                  </tr>
                ) : (
                  currentItems.map(marque => (
                    <tr key={marque.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedMarques.includes(marque.id)}
                          onChange={() => handleSelectMarque(marque.id)}
                        />
                      </td>
                      <td>{marque.id}</td>
                      <td>{marque.nom}</td>
                      <td>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteMarque(marque.id)}>
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

export default MarqueList; 