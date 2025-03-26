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
  const [searchDate, setSearchDate] = useState("");
  const [searchArticle, setSearchArticle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/api/demandes`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      .then((response) => {
        setDemandes(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de récupérer les demandes.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement des demandes...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  // Filtrage des demandes
  const filteredDemandes = demandes.filter((demande) => {
    const matchesAgent = searchAgent
      ? demande.agentNom.toLowerCase().includes(searchAgent.toLowerCase())
      : true;
    const matchesDate = searchDate ? demande.date.includes(searchDate) : true;
    const matchesArticle = searchArticle
      ? demande.lignes.some((ligne) =>
          ligne.designation.toLowerCase().includes(searchArticle.toLowerCase())
        )
      : true;
    return matchesAgent && matchesDate && matchesArticle;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDemandes.slice(indexOfFirstItem, indexOfLastItem);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="🔍 Rechercher par article"
            value={searchArticle}
            onChange={(e) => setSearchArticle(e.target.value)}
          />
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
        {[...Array(Math.ceil(filteredDemandes.length / itemsPerPage)).keys()].map(
          (number) => (
            <Pagination.Item
              key={number + 1}
              active={number + 1 === currentPage}
              onClick={() => paginate(number + 1)}
            >
              {number + 1}
            </Pagination.Item>
          )
        )}
      </Pagination>
    </Container>
  );
};

export default MesDemandes;
