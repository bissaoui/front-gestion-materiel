import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/auth';
import { getToken } from '../../utils/storage';
import { Container, Row, Col, Form, Button, Table, Alert, Spinner, Badge, Nav } from 'react-bootstrap';
import PaginationControl from '../../components/PaginationControl';
import { Link } from 'react-router-dom';
import CardLayout from '../../components/CardLayout';
import MaterielForm from '../../components/MaterielForm';
import navTabs from '../../components/adminNavTabs';

const AffectationsList = () => {
  const [materiels, setMateriels] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMarque, setSelectedMarque] = useState('');
  const [selectedModele, setSelectedModele] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${API_URL}/api/materiels`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      axios.get(`${API_URL}/api/types`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      axios.get(`${API_URL}/api/marques`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      axios.get(`${API_URL}/api/modeles`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      axios.get(`${API_URL}/api/agents`, { headers: { Authorization: `Bearer ${getToken()}` } })
    ]).then(([matRes, typeRes, marqueRes, modeleRes, agentRes]) => {
      setMateriels(Array.isArray(matRes.data) ? matRes.data : []);
      setTypes(Array.isArray(typeRes.data) ? typeRes.data : []);
      setMarques(Array.isArray(marqueRes.data) ? marqueRes.data : []);
      setModeles(Array.isArray(modeleRes.data) ? modeleRes.data : []);
      setAgents(Array.isArray(agentRes.data) ? agentRes.data : []);
    }).catch(() => setError("Erreur lors du chargement des données"))
      .finally(() => setLoading(false));
  }, []);

  const handleDesaffecter = async (id) => {
    if (!window.confirm('Désaffecter ce matériel ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/api/materiels/${id}/desaffecter`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSuccess('Matériel désaffecté avec succès');
      // Refresh
      const res = await axios.get(`${API_URL}/api/materiels`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setMateriels(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de la désaffectation");
    }
    setLoading(false);
  };

  // Filtrage
  const filteredMateriels = materiels.filter(m => {
    const matchNumSerie = m.numeroSerie?.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType ? m.typeMaterielId === Number(selectedType) : true;
    const matchMarque = selectedMarque ? m.marqueId === Number(selectedMarque) : true;
    const matchModele = selectedModele ? m.modeleId === Number(selectedModele) : true;
    const matchAgent = selectedAgent ? m.agentId === Number(selectedAgent) : true;
    return matchNumSerie && matchType && matchMarque && matchModele && matchAgent;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMateriels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMateriels.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // reset page when itemsPerPage changes
  }, [itemsPerPage]);

  return (
    <CardLayout
      title="Affectations des Matériels"
      navTabs={navTabs}
      currentPath={window.location.pathname}
    >
      <Row className="mb-3 g-2">
        <Col md={2}>
          <Form.Control
            type="text"
            placeholder="Recherche numéro de série"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            <option value="">Tous les types</option>
            {types.map(type => (
              <option key={type.id} value={type.id}>{type.nom}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select value={selectedMarque} onChange={e => setSelectedMarque(e.target.value)}>
            <option value="">Toutes les marques</option>
            {marques
              .filter(ma => !selectedType || (ma.types && ma.types.some(t => t.id === Number(selectedType))) || ma.typeMaterielId === Number(selectedType))
              .map(marque => (
                <option key={marque.id} value={marque.id}>{marque.nom}</option>
              ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select value={selectedModele} onChange={e => setSelectedModele(e.target.value)}>
            <option value="">Tous les modèles</option>
            {modeles.map(modele => (
              <option key={modele.id} value={modele.id}>{modele.nom}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}>
            <option value="">Tous les agents</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.nom} {agent.username}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center my-4"><Spinner animation="border" /></div>
      ) : (
        <div className="table-responsive">
          <Table bordered hover className="bg-white shadow-sm">
            <thead className="table-light">
              <tr>
                <th>Numéro de série</th>
                <th>Type</th>
                <th>Marque</th>
                <th>Modèle</th>
                <th>Agent</th>
                <th>Date d'affectation</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted">Aucun matériel trouvé.</td>
                </tr>
              ) : (
                currentItems.map(m => {
                  const type = types.find(t => t.id === m.typeMaterielId)?.nom || '-';
                  const marque = marques.find(ma => ma.id === m.marqueId)?.nom || '-';
                  const modele = modeles.find(mo => mo.id === m.modeleId)?.nom || '-';
                  const agent = agents.find(a => a.id === m.agentId);
                  const statut = m.agentId ? 'Affecté' : 'Disponible';
                  return (
                    <tr key={m.id}>
                      <td>{m.numeroSerie}</td>
                      <td>{type}</td>
                      <td>{marque}</td>
                      <td>{modele}</td>
                      <td>{agent ? `${agent.nom} ${agent.username}` : <Badge bg="secondary">-</Badge>}</td>
                      <td>{m.dateAffectation ? new Date(m.dateAffectation).toLocaleDateString() : <Badge bg="secondary">-</Badge>}</td>
                      <td>
                        {m.agentId ? <Badge bg="success">Affecté</Badge> : <Badge bg="warning">Disponible</Badge>}
                      </td>
                      <td>
                        {m.agentId && (
                          <Button variant="outline-danger" size="sm" onClick={() => handleDesaffecter(m.id)}>
                            Désaffecter
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
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
      )}
    </CardLayout>
  );
};

export default AffectationsList; 