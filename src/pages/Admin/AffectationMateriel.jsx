import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/auth';
import { getToken } from '../../utils/storage';
import { Container, Form, Button, Alert, Row, Col, Spinner, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AffectationMateriel = () => {
  const [agents, setAgents] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMarque, setSelectedMarque] = useState('');
  const [selectedModele, setSelectedModele] = useState('');
  const [selectedMateriel, setSelectedMateriel] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Charger la liste des agents
    axios.get(`${API_URL}/api/agents`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(res => setAgents(res.data))
      .catch(() => setError("Erreur lors du chargement des agents"));
    // Charger tous les types
    axios.get(`${API_URL}/api/types`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(res => setTypes(res.data))
      .catch(() => setTypes([]));
  }, []);

  useEffect(() => {
    if (selectedType) {
      axios.get(`${API_URL}/api/marques/by-type/${selectedType}`, { headers: { Authorization: `Bearer ${getToken()}` } })
        .then(res => setMarques(Array.isArray(res.data) ? res.data : []))
        .catch(() => setMarques([]));
    } else {
      setMarques([]);
      setSelectedMarque('');
    }
    setModeles([]);
    setSelectedModele('');
    setMateriels([]);
    setSelectedMateriel('');
  }, [selectedType]);

  useEffect(() => {
    if (selectedMarque) {
      axios.get(`${API_URL}/api/modeles/by-marque/${selectedMarque}`, { headers: { Authorization: `Bearer ${getToken()}` } })
        .then(res => setModeles(Array.isArray(res.data) ? res.data : []))
        .catch(() => setModeles([]));
    } else {
      setModeles([]);
      setSelectedModele('');
    }
    setMateriels([]);
    setSelectedMateriel('');
  }, [selectedMarque]);

  useEffect(() => {
    if (selectedModele) {
      axios.get(`${API_URL}/api/materiels`, { headers: { Authorization: `Bearer ${getToken()}` } })
        .then(res => {
          // Filtrer les matériels non affectés et du modèle sélectionné
          const disponibles = Array.isArray(res.data)
            ? res.data.filter(m => m.modeleId === Number(selectedModele) && !m.agentId)
            : [];
          setMateriels(disponibles);
        })
        .catch(() => setMateriels([]));
    } else {
      setMateriels([]);
      setSelectedMateriel('');
    }
  }, [selectedModele]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!selectedAgent || !selectedMateriel) {
      setError('Veuillez sélectionner un agent et un matériel.');
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/api/materiels/${selectedMateriel}/affecter/${selectedAgent}`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSuccess('Affectation réussie !');
      setError('');
      setSelectedType('');
      setSelectedMarque('');
      setSelectedModele('');
      setSelectedMateriel('');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'affectation.");
      setSuccess('');
    }
    setLoading(false);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Affecter un Matériel à un Utilisateur</h2>
      <Nav variant="tabs" className="mb-3">
        <Nav.Item><Nav.Link as={Link} to="/types">Types</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/marques">Marques</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/modeles">Modèles</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/materiels">Matériels</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/ajouter-materiel">Ajouter Matériel</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/affectations" active>Affecter</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/affectations-liste">Affectations (liste)</Nav.Link></Nav.Item>
      </Nav>
      <Form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white">
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Agent</Form.Label>
              <Form.Select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} required>
                <option value="">Sélectionner un agent</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.nom} {agent.prenom}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Type</Form.Label>
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
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Matériel (Numéro de série)</Form.Label>
              <Form.Select value={selectedMateriel} onChange={e => setSelectedMateriel(e.target.value)} required disabled={!selectedModele}>
                <option value="">Sélectionner un matériel</option>
                {materiels.length === 0 ? (
                  <option disabled>Aucun matériel disponible</option>
                ) : (
                  materiels.map(m => (
                    <option key={m.id} value={m.id}>{m.numeroSerie}</option>
                  ))
                )}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" variant="primary" className="w-100" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Affecter"}
        </Button>
      </Form>
    </Container>
  );
};

export default AffectationMateriel; 