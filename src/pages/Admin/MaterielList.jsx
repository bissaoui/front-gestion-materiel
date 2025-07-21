import React, { useEffect, useState } from 'react';
import { getMateriels, getTypes, getMarques, getModeles, deleteMateriel } from '../../api/materiel';
import { Container, Row, Col, Form, Button, Table, Alert, Spinner, Nav } from 'react-bootstrap';
import PaginationControl from '../../components/PaginationControl';
import { Link } from 'react-router-dom';

const MaterielList = () => {
  const [materiels, setMateriels] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedMarque, setSelectedMarque] = useState('');
  const [selectedModele, setSelectedModele] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Chargement initial
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMateriels(),
      getTypes(),
      getMarques(), // toutes les marques
      getModeles()   // tous les modèles
    ]).then(([matRes, typeRes, marqueRes, modeleRes]) => {
      setMateriels(Array.isArray(matRes.data) ? matRes.data : []);
      setTypes(Array.isArray(typeRes.data) ? typeRes.data : []);
      setMarques(Array.isArray(marqueRes.data) ? marqueRes.data : []);
      setModeles(Array.isArray(modeleRes.data) ? modeleRes.data : []);
    }).catch(() => setError("Erreur lors du chargement des données"))
      .finally(() => setLoading(false));
  }, []);

  // useEffect pour selectedType et selectedMarque supprimés : on garde toutes les marques et modèles chargées au début

  // Charger les modèles selon la marque sélectionnée
  useEffect(() => {
    if (selectedMarque) {
      // getModeles(selectedMarque) // This line is removed
      // .then(res => setModeles(Array.isArray(res.data) ? res.data : []))
      // .catch(() => setModeles([]));
      // The modeles filter will now use the pre-loaded modeles
    } else {
      setModeles([]);
      setSelectedModele('');
    }
  }, [selectedMarque]);

  // Suppression d'un matériel
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce matériel ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await deleteMateriel(id);
      setSuccess('Matériel supprimé avec succès');
      const res = await getMateriels();
      setMateriels(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de la suppression du matériel");
    }
    setLoading(false);
  };

  // Filtrage
  const filteredMateriels = materiels.filter(m => {
    const matchNumSerie = m.numeroSerie?.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType ? m.typeMaterielId === Number(selectedType) : true;
    const matchMarque = selectedMarque ? m.marqueId === Number(selectedMarque) : true;
    const matchModele = selectedModele ? m.modeleId === Number(selectedModele) : true;
    return matchNumSerie && matchType && matchMarque && matchModele;
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
    <Container className="mt-4">
      <h2 className="mb-4">Liste des Matériels</h2>
      <Nav variant="tabs" className="mb-3">
        <Nav.Item><Nav.Link as={Link} to="/types">Types</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/marques">Marques</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/modeles">Modèles</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/materiels" active>Matériels</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/ajouter-materiel">Ajouter Matériel</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/affectations">Affecter</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/affectations-liste">Affectations (liste)</Nav.Link></Nav.Item>
      </Nav>
      <Row className="mb-3 g-2">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Recherche par numéro de série"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            <option value="">Tous les types</option>
            {types.map(type => (
              <option key={type.id} value={type.id}>{type.nom}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={selectedMarque} onChange={e => setSelectedMarque(e.target.value)}>
            <option value="">Toutes les marques</option>
            {marques.map(marque => (
              <option key={marque.id} value={marque.id}>{marque.nom}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={selectedModele} onChange={e => setSelectedModele(e.target.value)}>
            <option value="">Tous les modèles</option>
            {modeles
              .filter(mo => !selectedMarque || mo.marqueId === Number(selectedMarque))
              .map(modele => (
                <option key={modele.id} value={modele.id}>{modele.nom}</option>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">Aucun matériel trouvé.</td>
                </tr>
              ) : (
                currentItems.map(m => (
                  <tr key={m.id}>
                    <td>{m.numeroSerie}</td>
                    <td>{types.find(t => t.id === m.typeMaterielId)?.nom || '-'}</td>
                    <td>{marques.find(ma => ma.id === m.marqueId)?.nom || '-'}</td>
                    <td>{modeles.find(mo => mo.id === m.modeleId)?.nom || '-'}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(m.id)}>
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
      )}
    </Container>
  );
};

export default MaterielList; 