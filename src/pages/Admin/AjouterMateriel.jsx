import React, { useEffect, useState } from 'react';
import { getTypes, getMarques, getModeles, addMateriel } from '../../api/materiel';
import { Container, Row, Col, Form, Button, Alert, Spinner, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AjouterMateriel = () => {
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [marques, setMarques] = useState([]);
  const [selectedMarque, setSelectedMarque] = useState('');
  const [modeles, setModeles] = useState([]);
  const [selectedModele, setSelectedModele] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getTypes()
      .then(res => setTypes(res.data))
      .catch(() => setTypes([]));
  }, []);

  useEffect(() => {
    if (selectedType) {
      getMarques(selectedType)
        .then(res => setMarques(Array.isArray(res.data) ? res.data : []))
        .catch(() => setMarques([]));
    } else {
      setMarques([]);
      setSelectedMarque('');
    }
    setModeles([]);
    setSelectedModele('');
  }, [selectedType]);

  useEffect(() => {
    if (selectedMarque) {
      getModeles(selectedMarque)
        .then(res => setModeles(Array.isArray(res.data) ? res.data : []))
        .catch(() => setModeles([]));
    } else {
      setModeles([]);
      setSelectedModele('');
    }
  }, [selectedMarque]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!numeroSerie.trim() || !selectedType || !selectedMarque || !selectedModele) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setLoading(true);
    // Ajout du log pour voir le body envoyé
    const body = {
      numeroSerie,
      typeMaterielId: selectedType,
      marqueId: selectedMarque,
      modeleId: selectedModele
    };
    console.log('Body envoyé au backend:', body);
    try {
      await addMateriel(body);
      setSuccess('Matériel ajouté avec succès !');
      setNumeroSerie('');
      setSelectedType('');
      setSelectedMarque('');
      setSelectedModele('');
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de l'ajout du matériel.");
    }
    setLoading(false);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Ajouter un Matériel</h2>
      <Nav variant="tabs" className="mb-3">
        <Nav.Item><Nav.Link as={Link} to="/types">Types</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/marques">Marques</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/modeles">Modèles</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/materiels">Matériels</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/ajouter-materiel" active>Ajouter Matériel</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/affectations">Affecter</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/affectations-liste">Affectations (liste)</Nav.Link></Nav.Item>
      </Nav>
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm">
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Numéro de série <span style={{color:'red'}}>*</span></Form.Label>
              <Form.Control type="text" required value={numeroSerie} onChange={e => setNumeroSerie(e.target.value)} placeholder="Numéro de série" />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Type de matériel</Form.Label>
              <Form.Select value={selectedType} onChange={e => setSelectedType(e.target.value)} required>
                <option value="">Sélectionner un type</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>{type.nom}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Marque</Form.Label>
              <Form.Select value={selectedMarque} onChange={e => setSelectedMarque(e.target.value)} required disabled={!selectedType}>
                <option value="">Sélectionner une marque</option>
                {marques.map(marque => (
                  <option key={marque.id} value={marque.id}>{marque.nom}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Modèle</Form.Label>
              <Form.Select value={selectedModele} onChange={e => setSelectedModele(e.target.value)} required disabled={!selectedMarque}>
                <option value="">Sélectionner un modèle</option>
                {modeles.map(modele => (
                  <option key={modele.id} value={modele.id}>{modele.nom}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" variant="primary" disabled={loading} className="w-100">
          {loading ? <Spinner animation="border" size="sm" /> : "Ajouter le matériel"}
        </Button>
      </Form>
    </Container>
  );
};

export default AjouterMateriel; 