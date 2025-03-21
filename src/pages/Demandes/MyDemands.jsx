import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, Form, Button } from "react-bootstrap";
import axios from "axios";
import { getToken } from "../../utils/storage";
import { API_URL } from "../../api/auth";
import { jsPDF } from "jspdf";

const MesDemandes = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchAgent, setSearchAgent] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchArticle, setSearchArticle] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/demandes`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      .then((response) => {
        setDemandes(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError("Impossible de récupérer les demandes.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement des demandes...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  // Fonction pour générer un PDF avec un nouveau design
  const generatePDF = (demande) => {
    const pdf = new jsPDF();
    const img = new Image();
    img.src = "/logo.png";
    pdf.addImage(img, "PNG", 52, 5, 100, 34);

    let yline = 83;
    

    // Titre du document
    pdf.setFontSize(17);
    pdf.setFont("helvetica", "bold"); // Texte en gras
    pdf.text("DEMANDE FOURNITURE INFORMATIQUE ", 45, 45);
    
    // Informations générales
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold"); // Texte en gras

    pdf.text(`N° Demande: ${demande.id}`, 10, 60);
    pdf.text(`${new Date(demande.date).toLocaleDateString()}`, 150, 60);
    pdf.text("Demendeur", 10, 70);
    pdf.line(120, 63, 183, 63);

    pdf.line(120, 73, 183, 73);

    pdf.text(" : ", 50, 70);
    pdf.text(`${demande.agentName}`, 150, 70, { align: "center" });

    pdf.text("Direction" , 10, 80);
    pdf.line(120, 83, 183, 83);

    pdf.text(" : ", 50, 80);

    pdf.text(`${demande.direction}`, 150, 80, { align: "center" });
    if (demande.departement) {
    pdf.text("Département", 10, 90);
    pdf.line(120, 93, 183, 93);
    yline = 93;
    pdf.text(" : ", 50, 90);

    pdf.text(`${demande.departement}`, 150, 90, { align: "center" });
    }
    if (demande.service) {
    pdf.text("Service" , 10, 100);
    pdf.line(120, 103.5, 183, 103.5);
    yline = 103.5;
    pdf.text(" : ", 50, 100);

    pdf.text(`${demande.service}`, 150, 100, { align: "center" });
    }
  
    pdf.setFont("helvetica", "normal"); // Texte en gras
    pdf.line(120, 63, 120, yline);
    pdf.line(183, 63, 183, yline);



    pdf.setFontSize(10);
    let y = 120;

    pdf.text("Code", 10, y);
    pdf.text("Désignation", 50, y);
    pdf.text("Unité", 110, y);
    pdf.text("Quantité", 130, y);
    pdf.text("Observation", 150, y);
    
    y += 5;
    pdf.line(10, y, 200, y);
    y += 5;

    // Affichage des articles demandés
    demande.lignes.forEach((ligne, index) => {
      pdf.text(ligne.codeArticle, 10, y);
      pdf.line(10, y+3, 200, y+3);

      pdf.text(ligne.designation, 50, y);
      pdf.text(ligne.unite, 110, y);
      pdf.text(String(ligne.quantite), 130, y);
      pdf.text(String(ligne.observation), 150, y);

      y += 8;
    });

    // Enregistrement du fichier PDF
    pdf.save(`Demande_${demande.id}.pdf`);
  };

  // Filtrage des demandes
  const filteredDemandes = demandes.filter((demande) => {
    const matchesAgent = searchAgent
      ? demande.agentName.toLowerCase().includes(searchAgent.toLowerCase())
      : true;
    const matchesDate = searchDate ? demande.date.includes(searchDate) : true;
    const matchesArticle = searchArticle
      ? demande.lignes.some((ligne) =>
          ligne.designation.toLowerCase().includes(searchArticle.toLowerCase())
        )
      : true;

    return matchesAgent && matchesDate && matchesArticle;
  });

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

      {/* Cartes des demandes */}
      <Row>
        {filteredDemandes.length === 0 ? (
          <p className="text-center text-muted">Aucune demande trouvée.</p>
        ) : (
          filteredDemandes.map((demande) => (
            <Col md={6} lg={4} key={demande.id}>
              <Card className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>📌 Demande #{demande.id}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    🗓 {new Date(demande.date).toLocaleDateString()}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Agent :</strong> {demande.agentName}
                  </Card.Text>
                  <Card.Text>
                    <strong>Direction :</strong> {demande.direction}
                  </Card.Text>
                  <Card.Text>
                    <strong>Département :</strong> {demande.departement}
                  </Card.Text>
                  <Card.Text>
                    <strong>Service :</strong> {demande.service}
                  </Card.Text>
                  <Card.Text>
                    <strong>Articles Demandés :</strong>
                    <ul>
                      {demande.lignes.map((ligne) => (
                        <li key={ligne.id}>
                          {ligne.designation} - {ligne.quantite} {ligne.unite}
                        </li>
                      ))}
                    </ul>
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => generatePDF(demande)}
                  >
                    📄 Générer PDF
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default MesDemandes;
