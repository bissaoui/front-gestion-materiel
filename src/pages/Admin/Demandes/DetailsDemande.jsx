import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Container, Button, Spinner, Table } from "react-bootstrap";
import axios from "axios";
import { getToken } from "../../../utils/storage";
import { API_URL } from "../../../api/auth";
import { jsPDF } from "jspdf";

const DemandeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validating, setValidating] = useState(false);
  const generatePDF = (demande) => {
    const pdf = new jsPDF();
    const img = new Image();
        let y = 80;

    img.src = "/logo.png";
    pdf.addImage(img, "PNG", 10, 5, 50, 16);
      
    // Titre du document
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold"); // Texte en gras
    pdf.text("BON DE SORTIE", 100, 30, { align: "center" });
    pdf.text("\"Fournitures informatique\"",100, 37,{align: "center"});
    let titlesy = 50;

    // Informations générales
    pdf.setFontSize(11);
    pdf.setFont("times"); // Texte en gras
    pdf.text("DIRECTION: ", 10, titlesy);
    const serviceOrDeptOrDir = demande.service 
    ? demande.service 
    : demande.departement 
      ? demande.departement 
      : demande.direction;
  
  const formattedId = demande.id.toString().padStart(3, '0');
  
    pdf.text(`N°:      ${formattedId}/${serviceOrDeptOrDir}/${new Date().getFullYear()}`, 150, titlesy);
    pdf.text(demande.directionName, 100, titlesy, { align: "center" });
    pdf.text(`DATE:      ${new Date(demande.date).toLocaleDateString()}`, 150, titlesy=titlesy+7);

    if (demande.departement) {
      pdf.text("DEPARTEMENT:", 10, titlesy);
      pdf.text(demande.departementName, 100, titlesy, { align: "center" });
    }
   if (demande.service) {
    pdf.text("SERVICE:" , 10, titlesy=titlesy + 7);
    pdf.text(demande.serviceName, 100, titlesy, { align: "center" });
   }
   if (!demande.departement && !demande.service) {
    titlesy = titlesy - 7; }
    pdf.text("LE PRENEUR" , 10, titlesy=titlesy + 7);
    
    pdf.text(`${demande.agentPrenom} ${demande.agentNom.toUpperCase()}`, 100, titlesy, { align: "center" });

  
  
  
   
    pdf.setFont("helvetica", "normal"); // Texte en gras
  
    pdf.setFontSize(10);

 

    // Largeurs des colonnes
    const colX = [10, 50, 130, 150, 170, 200]; // Ajout d'un dernier point pour la fin du tableau
    
    // Couleur de fond pour le header (gris clair)
    pdf.setFillColor(200, 200, 200);

    pdf.rect(10, y, 190, 8, "F"); // Rectangle avec remplissage
    pdf.rect(10, y, 190, 8); // Bordure du titre

    // Style du texte
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    
    // Texte des en-têtes
    pdf.text("Code", colX[0] + 5, y + 5);
    pdf.text("Désignation", colX[1] + 20, y + 5);
    pdf.text("Unité", colX[2] + 5, y + 5);
    pdf.text("Quantité", colX[3] + 3, y + 5);
    pdf.text("Observation", colX[4] + 5, y + 5);
    
    y += 8;
    
    // Contenu du tableau
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    
    demande.lignes.forEach((ligne) => {
      // Dessiner la bordure complète de la ligne
      pdf.rect(10, y, 190, 8); 
      
      // Texte des cellules
      pdf.text(ligne.codeArticle, colX[0] + 5, y + 5);
      pdf.text(ligne.designation, colX[1] + 5, y + 5);
      pdf.text(ligne.unite, colX[2] + 5, y + 5);
      pdf.text(String(ligne.quantite), colX[3] + 5, y + 5);
      pdf.text(ligne.observation || "-", colX[4] + 5, y + 5);
      
      // Dessiner les bordures verticales pour chaque colonne
      colX.forEach((x) => pdf.line(x, y, x, y + 8));
    
      y += 8;
    });
    
    // Dessiner la dernière bordure verticale à la fin du tableau
    pdf.line(colX[colX.length - 1], 90, colX[colX.length - 1], y);
    

    pdf.setFont("helvetica", "bold");
    pdf.text("Signature du preneur :", 85, y + 10);
    
        // Sauvegarde du fichier PDF
        pdf.save(`Demande_${demande.id}.pdf`);
      
    
  };
  

  

  useEffect(() => {
    axios
      .get(`${API_URL}/api/demandes/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      .then((response) => {
        setDemande(response.data);
        console.log(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement de la demande.");
        setLoading(false);
      });
  }, [id]);

  const validateDemande = () => {
    setValidating(true);
    axios
      .put(`${API_URL}/api/demandes/${id}/validate`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      .then((response) => {
        setDemande(response.data);
        setValidating(false);
      })
      .catch(() => {
        setValidating(false);
        alert("Erreur lors de la validation.");
      });
  };



  if (loading) return <p className="text-center">Chargement...</p>;
  if (error) return <p className="text-danger text-center">{error}</p>;

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>📌 Détails de la Demande #{demande.id}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            🗓 {new Date(demande.date).toLocaleDateString()}
          </Card.Subtitle>
          <Card.Text>
            <strong>Agent :</strong> {demande.agentNom.toUpperCase()} {demande.agentPrenom}
          </Card.Text>
          <Card.Text>
            <strong>Direction :</strong> {demande.direction}
          </Card.Text>
          {demande.departement && 
          <Card.Text>
            <strong>Département :</strong> {demande.departement}

            </Card.Text>
            }
            {demande.service && 
                
          <Card.Text>
            <strong>Service :</strong> {demande.service}
          </Card.Text>
            }
          {/* Tableau des articles demandés */}
          <h5 className="mt-4">📦 Articles Demandés</h5>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>Désignation</th>
                <th>Unité</th>
                <th>Quantité</th>
              </tr>
            </thead>
            <tbody>
  {demande.lignes && demande.lignes.length > 0 ? (
    demande.lignes.map((ligne, index) => (
      <tr key={ligne.id}>
        <td>{index + 1}</td>
        <td>{ligne.codeArticle}</td>
        <td>{ligne.designation}</td>
        <td>{ligne.unite}</td>
        <td>{ligne.quantite}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" className="text-center">Aucun article trouvé</td>
    </tr>
  )}
</tbody>
          </Table>

          {/* Boutons */}
          <div className="d-flex gap-2 mt-3">
            <Button variant="success" onClick={validateDemande} disabled={validating || demande.validation}>
              {validating ? <Spinner as="span" animation="border" size="sm" /> : demande.validation ? "✅ Validée" : "✔ Valider"}
            </Button>
            <Button variant="primary" onClick={() => generatePDF(demande)}>📄 Imprimer PDF</Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>⬅ Retour</Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DemandeDetails;
