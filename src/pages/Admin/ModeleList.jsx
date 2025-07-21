import React, { useEffect, useState } from 'react';
import { getTypes, getMarques, getModeles, addModele, deleteModele, getModelesByMarqueAndType } from '../../api/materiel';
import { Container, Row, Col, Form, Button, Table, Alert, Spinner, Nav } from 'react-bootstrap';
import PaginationControl from '../../components/PaginationControl';
import { Link } from 'react-router-dom';

const ModeleList = () => {
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [marques, setMarques] = useState([]);
  const [selectedMarque, setSelectedMarque] = useState('');
  const [modeles, setModeles] = useState([]);
  const [newModele, setNewModele] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedModeles, setSelectedModeles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

  // Afficher toutes les marques et tous les types dans les selects
  useEffect(() => {
    getTypes()
      .then(res => setTypes(res.data))
      .catch(() => setTypes([]));
    getMarques()
      .then(res => setMarques(Array.isArray(res.data) ? res.data : []))
      .catch(() => setMarques([]));
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
  }, [selectedType]);

  // Adapter le useEffect pour charger les modèles selon le filtre
  useEffect(() => {
    if (selectedType && selectedMarque) {
      setLoading(true);
      getModelesByMarqueAndType(selectedMarque, selectedType)
        .then(res => setModeles(Array.isArray(res.data) ? res.data : []))
        .catch(() => setModeles([]))
        .finally(() => setLoading(false));
    } else if (selectedType && !selectedMarque) {
      setLoading(true);
      getModelesByMarqueAndType(null, selectedType)
        .then(res => setModeles(Array.isArray(res.data) ? res.data : []))
        .catch(() => setModeles([]))
        .finally(() => setLoading(false));
    } else if (!selectedType && selectedMarque) {
      setLoading(true);
      getModelesByMarqueAndType(selectedMarque, null)
        .then(res => setModeles(Array.isArray(res.data) ? res.data : []))
        .catch(() => setModeles([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(true);
      getModelesByMarqueAndType()
        .then(res => setModeles(Array.isArray(res.data) ? res.data : []))
        .catch(() => setModeles([]))
        .finally(() => setLoading(false));
    }
  }, [selectedMarque, selectedType]);

  // Pagination logic
  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = modeles.slice(indexOfFirstItem, indexOfLastItem);
  // const totalPages = Math.ceil(modeles.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // reset page when itemsPerPage changes
  }, [itemsPerPage]);

  const handleAddModele = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newModele.trim() || !selectedMarque || !selectedType) return;
    setLoading(true);
    try {
      await addModele(newModele, selectedMarque, selectedType);
      setNewModele('');
      setSuccess('Modèle ajouté avec succès');
      const res = await getModelesByMarqueAndType(selectedMarque, selectedType);
      setModeles(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de l'ajout du modèle");
    }
    setLoading(false);
  };

  const handleDeleteModele = async (id) => {
    if (!window.confirm('Supprimer ce modèle ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await deleteModele(id);
      setSuccess('Modèle supprimé avec succès');
      const res = await getModelesByMarqueAndType(selectedMarque, selectedType);
      setModeles(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if (e.response?.status === 500) {
        setError("Impossible de supprimer ce modèle car il est utilisé par des matériels.");
      } else {
        setError(e.response?.data?.message || "Erreur lors de la suppression du modèle");
      }
    }
    setLoading(false);
  };

  const handleSelectModele = (id) => {
    setSelectedModeles(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedModeles.length === modeles.length) {
      setSelectedModeles([]);
    } else {
      setSelectedModeles(modeles.map(m => m.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedModeles.length === 0) return;
    if (!window.confirm('Supprimer tous les modèles sélectionnés ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    let hasError = false;
    for (const id of selectedModeles) {
      try {
        await deleteModele(id);
      } catch (e) {
        hasError = true;
      }
    }
    if (hasError) {
      setError("Certains modèles n'ont pas pu être supprimés car ils sont utilisés.");
    } else {
      setSuccess('Modèles supprimés avec succès');
    }
    setSelectedModeles([]);
    const res = await getModelesByMarqueAndType(selectedMarque, selectedType);
    setModeles(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  // Filtrage par recherche
  const filteredModeles = modeles.filter(modele =>
    modele.nom.toLowerCase().includes(search.toLowerCase())
  );
  // Tri
  const sortedModeles = [...filteredModeles].sort((a, b) => {
    let aValue, bValue;
    switch (sortConfig.key) {
      case "type":
        aValue = types.find(t => t.id === a.typeMaterielId)?.nom || "";
        bValue = types.find(t => t.id === b.typeMaterielId)?.nom || "";
        break;
      case "marque":
        aValue = marques.find(m => m.id === a.marqueId)?.nom || "";
        bValue = marques.find(m => m.id === b.marqueId)?.nom || "";
        break;
      case "nom":
        aValue = a.nom;
        bValue = b.nom;
        break;
      default:
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
    }
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
  // Pagination (à garder après le tri et le filtrage)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedModeles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedModeles.length / itemsPerPage);

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Gestion des Modèles</h2>
      <Nav variant="tabs" className="mb-3">
        <Nav.Item><Nav.Link as={Link} to="/types">Types</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/marques">Marques</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/modeles" active>Modèles</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/materiels">Matériels</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/ajouter-materiel">Ajouter Matériel</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/affectations">Affecter</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link as={Link} to="/affectations-liste">Affectations (liste)</Nav.Link></Nav.Item>
      </Nav>
      <Form className="mb-4 p-3 border rounded bg-white shadow-sm" onSubmit={handleAddModele}>
        <Row className="mb-2 align-items-center">
          <Col md={6} className="mb-2 mb-md-0">
            <Form.Control
              type="text"
              placeholder="Rechercher un modèle..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </Col>
          <Col md={6} className="text-md-end text-muted small">
            {selectedType && types.find(t => t.id === selectedType) ? `Type : ${types.find(t => t.id === selectedType)?.nom}` : "Type : Tous"}
            {" | "}
            {selectedMarque && marques.find(m => m.id === selectedMarque) ? `Marque : ${marques.find(m => m.id === selectedMarque)?.nom}` : "Marque : Toutes"}
          </Col>
        </Row>
        <Row className="align-items-center g-2">
          <Col xs={12} md={4} className="mb-2 mb-md-0">
            <Form.Select value={selectedType} onChange={e => setSelectedType(e.target.value)} required>
              <option value="">Tous les types</option>
              {types.map(type => (
                <option key={type.id} value={type.id}>{type.nom}</option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} md={4} className="mb-2 mb-md-0">
            <Form.Select value={selectedMarque} onChange={e => setSelectedMarque(e.target.value)} required>
              <option value="">Toutes les marques</option>
              {marques.map(marque => (
                <option key={marque.id} value={marque.id}>{marque.nom}</option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} md={3} className="mb-2 mb-md-0">
            <Form.Control
              type="text"
              value={newModele}
              onChange={e => setNewModele(e.target.value)}
              placeholder="Nouveau modèle"
              required
              disabled={!selectedMarque}
            />
          </Col>
          <Col xs={12} md={1}>
            <Button type="submit" variant="primary" className="w-100" disabled={!selectedMarque}>Ajouter</Button>
          </Col>
        </Row>
      </Form>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="text-center my-4"><Spinner animation="border" /></div>
      ) : (
        <>
          <div className="mb-2">
            <Button variant="danger" size="sm" disabled={selectedModeles.length === 0} onClick={handleDeleteSelected}>
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
                      checked={selectedModeles.length === modeles.length && modeles.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th onClick={() => setSortConfig({ key: "id", direction: sortConfig.key === "id" && sortConfig.direction === "asc" ? "desc" : "asc" })} style={{cursor:'pointer'}}>
                    ID {sortConfig.key === "id" ? (sortConfig.direction === "asc" ? "▲" : "▼") : null}
                  </th>
                  <th onClick={() => setSortConfig({ key: "type", direction: sortConfig.key === "type" && sortConfig.direction === "asc" ? "desc" : "asc" })} style={{cursor:'pointer'}}>
                    Type {sortConfig.key === "type" ? (sortConfig.direction === "asc" ? "▲" : "▼") : null}
                  </th>
                  <th onClick={() => setSortConfig({ key: "marque", direction: sortConfig.key === "marque" && sortConfig.direction === "asc" ? "desc" : "asc" })} style={{cursor:'pointer'}}>
                    Marque {sortConfig.key === "marque" ? (sortConfig.direction === "asc" ? "▲" : "▼") : null}
                  </th>
                  <th onClick={() => setSortConfig({ key: "nom", direction: sortConfig.key === "nom" && sortConfig.direction === "asc" ? "desc" : "asc" })} style={{cursor:'pointer'}}>
                    Modèle {sortConfig.key === "nom" ? (sortConfig.direction === "asc" ? "▲" : "▼") : null}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">Aucun modèle trouvé.</td>
                  </tr>
                ) : (
                  currentItems.map(modele => (
                    <tr key={modele.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedModeles.includes(modele.id)}
                          onChange={() => handleSelectModele(modele.id)}
                        />
                      </td>
                      <td>{modele.id}</td>
                      <td>{types.find(t => t.id === modele.typeMaterielId)?.nom || '-'}</td>
                      <td>{marques.find(m => m.id === modele.marqueId)?.nom || '-'}</td>
                      <td>{modele.nom}</td>
                      <td>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteModele(modele.id)}>
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
            {/* Affichage du nombre de résultats */}
            <div className="mb-2 text-muted small">{sortedModeles.length} modèle(s) trouvé(s)</div>
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

export default ModeleList; 