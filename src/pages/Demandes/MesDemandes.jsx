import React, { useState, useEffect } from "react";
import { Container, Table, Button, Pagination, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../utils/storage";
import { API_URL } from "../../api/auth";

const MesDemandes = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchAgent, setSearchAgent] = useState("");
  const [searchDateStart, setSearchDateStart] = useState(""); // Date de début
  const [searchDateEnd, setSearchDateEnd] = useState(""); // Date de fin
  const [searchArticle, setSearchArticle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Nombre d'éléments par page
  const token = getToken();

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_URL}/api/demandes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setDemandes(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de récupérer les demandes.");
        setLoading(false);
      });
  }, [token, navigate]);

  if (!token) return null;
  if (loading) return <p>Chargement des demandes...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  // Filtrage des demandes avec l'intervalle de date
  const filteredDemandes = demandes.filter((demande) => {
    const matchesAgent = searchAgent
      ? demande.agentNom.toLowerCase().includes(searchAgent.toLowerCase())
      : true;
    
    const matchesArticle = searchArticle
      ? demande.lignes.some((ligne) =>
          ligne.designation.toLowerCase().includes(searchArticle.toLowerCase())
        )
      : true;

    const demandeDate = new Date(demande.date);
    const startDate = searchDateStart ? new Date(searchDateStart) : null;
    const endDate = searchDateEnd ? new Date(searchDateEnd) : null;

    const matchesDate =
      (startDate ? demandeDate >= startDate : true) &&
      (endDate ? demandeDate <= endDate : true);

    return matchesAgent && matchesDate && matchesArticle;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDemandes.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage);

  return (
    <Container className="mt-4">
      <h2 className="mb-4">📋 Demandes</h2>

      {/* Filtres de recherche */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="🔍 Rechercher par agent"
            value={searchAgent}
            onChange={(e) => setSearchAgent(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            type="date"
            value={searchDateStart}
            onChange={(e) => setSearchDateStart(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            type="date"
            value={searchDateEnd}
            onChange={(e) => setSearchDateEnd(e.target.value)}
          />
        </Col>
      </Row>


      <Row className="mb-3">
        <Col md={12}>
          <Form.Control
            type="text"
            placeholder="🔍 Rechercher par article"
            value={searchArticle}
            onChange={(e) => setSearchArticle(e.target.value)}
          />
        </Col>
      </Row>

      {/* Sélecteur du nombre d'éléments par page */}
      <Row className="mb-3 d-flex justify-content-between">
      <Col md={8}>
    {/* You can leave this empty or add content */}
  </Col>
        <Col md={2} className="d-flex justify-content-end">
          <Form.Select value={itemsPerPage} onChange={handleItemsPerPageChange}>
            <option value={10}>10 par page</option>
            <option value={20}>20 par page</option>
            <option value={50}>50 par page</option>
            <option value={100}>100 par page</option>
            <option value={200}>200 par page</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Tableau des demandes */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Agent</th>
            <th>Direction</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                Aucune demande trouvée.
              </td>
            </tr>
          ) : (
            currentItems.map((demande) => (
              <tr key={demande.id}>
                <td>{demande.id}</td>
                <td>{new Date(demande.date).toLocaleDateString()}</td>
                <td>{demande.agentNom.toUpperCase()} </td>
                <td>{demande.direction}</td>
                <td>{demande.validation ? "✅ Validée" : "❌ Non validée"}</td>
                <td>
                  <Button
                    variant="info"
                    onClick={() => navigate(`/demande/details/${demande.id}`)}
                  >
                    Détails
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination className="justify-content-center">
        {/* First Page */}
        <Pagination.First
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        />
        {/* Previous Page */}
        <Pagination.Prev
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {/* Pagination Items */}
        {[...Array(totalPages).keys()].map((number) => (
          <Pagination.Item
            key={number + 1}
            active={number + 1 === currentPage}
            onClick={() => paginate(number + 1)}
          >
            {number + 1}
          </Pagination.Item>
        ))}
        {/* Next Page */}
        <Pagination.Next
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        {/* Last Page */}
        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    </Container>
  );
};

export default MesDemandes;
