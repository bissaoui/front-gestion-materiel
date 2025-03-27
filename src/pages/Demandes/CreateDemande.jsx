import React, { useState, useEffect } from "react";
import { Container, Form, Button, Table, Alert, Row, Col, Card, Spinner } from "react-bootstrap";
import { FaPlus, FaTrash } from "react-icons/fa"; // Font Awesome icons for button
import axios from "axios";
import { getToken } from "../../utils/storage";
import { API_URL } from "../../api/auth";
import { useNavigate } from "react-router-dom";

const CreateDemande = () => {
  const [date, setDate] = useState("");
  const [agentId, setAgentId] = useState("");
  const [agents, setAgents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [lignes, setLignes] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(4);
  
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // Format as yyyy-mm-dd
    setDate(today);

    axios
      .get(`${API_URL}/api/agents`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((response) => setAgents(response.data))
      .catch((error) => console.error("Erreur chargement agents:", error));

    axios
      .get(`${API_URL}/api/articles`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((response) => setArticles(response.data))
      .catch((error) => console.error("Erreur chargement articles:", error));
  }, []);

  const addLigne = () => {
    setLignes([...lignes, { articleId: "", quantite: 1, observation: "" }]);
  };

  const updateLigne = (index, field, value) => {
    const updatedLignes = [...lignes];
    updatedLignes[index][field] = value;
    setLignes(updatedLignes);
    setErrors({ ...errors, [index]: "" });
  };

  const removeLigne = (index) => {
    setLignes(lignes.filter((_, i) => i !== index));
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[index];
      return updatedErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let lignesToSend = [];
    let hasError = false;
    let newErrors = {};

    // Vérification des quantités
    for (const [index, ligne] of lignes.entries()) {
      try {
        const articleResponse = await axios.get(
          `${API_URL}/api/articles/${ligne.articleId}`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );

        const article = articleResponse.data;
        if (article.qte < ligne.quantite) {
          newErrors[index] = `Stock insuffisant (${article.qte} restant)`;
          hasError = true;
        } else {
          lignesToSend.push({
            quantite: ligne.quantite,
            observation: ligne.observation,
            article: { id: ligne.articleId },
            nouvelleQuantite: article.qte - ligne.quantite,
          });
        }
      } catch (error) {
        newErrors[index] = "Erreur de vérification du stock.";
        hasError = true;
      }
    }

    setErrors(newErrors);
    if (hasError) return;

    // Création de la demande
    try {
      const demandeResponse = await axios.post(
        `${API_URL}/api/demandes`,
        { date, agent: { id: agentId } },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      const demandeId = demandeResponse.data.id;

      // Mise à jour des stocks et création des lignes de demande
      for (const ligne of lignesToSend) {
        await axios.put(
          `${API_URL}/api/articles/qte/${ligne.article.id}`,
          { quantite: ligne.nouvelleQuantite },
          { headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" } }
        );

        ligne.demande = { id: demandeId };
        delete ligne.nouvelleQuantite;
      }

      // Envoi des lignes de demande
      await axios.post(
        `${API_URL}/api/ligne-demandes/bulk`,
        lignesToSend,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      // ✅ Afficher message de succès et démarrer le compte à rebours
      setSuccessMessage("✅ Demande créée avec succès ! Redirection dans...");
      let counter = 4;
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
        counter--;
        if (counter === 0) {
          clearInterval(interval);
          navigate("/demandes");
        }
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la création de la demande:", error);
    }
  };

  //return (
  //   <Container className="mt-4">
  //     <h2>Créer une nouvelle demande</h2>
      
  //     {successMessage && (
  //       <Alert variant="success">
  //         {successMessage} <strong>{countdown}</strong>...
  //       </Alert>
  //     )}

  //     <Form onSubmit={handleSubmit}>
  //       <Form.Group className="mb-3">
  //         <Form.Label>Date</Form.Label>
  //         <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
  //       </Form.Group>

  //       <Form.Group className="mb-3">
  //         <Form.Label>Agent</Form.Label>
  //         <Form.Select value={agentId} onChange={(e) => setAgentId(e.target.value)} required>
  //           <option value="">Sélectionner un agent</option>
  //           {agents.map((agent) => (
  //             <option key={agent.id} value={agent.id}>{agent.nom}</option>
  //           ))}
  //         </Form.Select>
  //       </Form.Group>

  //       <h4>Lignes de demande</h4>
  //       <Table bordered>
  //         <thead>
  //           <tr>
  //             <th>Article</th>
  //             <th>Quantité</th>
  //             <th>Observation</th>
  //             <th>Actions</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {lignes.map((ligne, index) => (
  //             <tr key={index}>
  //               <td>
  //                 <Form.Select
  //                   value={ligne.articleId}
  //                   onChange={(e) => updateLigne(index, "articleId", e.target.value)}
  //                   required
  //                 >
  //                   <option value="">Sélectionner un article</option>
  //                   {articles.map((article) => (
  //                     <option key={article.id} value={article.id}>{article.designation}</option>
  //                   ))}
  //                 </Form.Select>
  //               </td>
  //               <td>
  //                 <Form.Control
  //                   type="number"
  //                   value={ligne.quantite}
  //                   onChange={(e) => updateLigne(index, "quantite", e.target.value)}
  //                   min="1"
  //                   required
  //                 />
  //                 {errors[index] && <small className="text-danger">{errors[index]}</small>}
  //               </td>
  //               <td>
  //                 <Form.Control
  //                   type="text"
  //                   value={ligne.observation}
  //                   onChange={(e) => updateLigne(index, "observation", e.target.value)}
  //                 />
  //               </td>
  //               <td>
  //                 <Button variant="danger" onClick={() => removeLigne(index)}>Supprimer</Button>
  //               </td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </Table>

  //       <Button variant="secondary" onClick={addLigne}>Ajouter une ligne</Button>
  //       <Button variant="primary" type="submit" className="mt-3">Créer la demande</Button>
  //     </Form>
  //   </Container>
  // );
  return (
    <Container className="d-flex justify-content-center align-items-center w-100" style={{ animation: "fadeIn 1s ease" }}>
      <Row className="mb-4">
        <Col>
          <Card className="shadow-lg p-4 m-5" style={{ maxWidth: "1000px" }}>
            <Card.Body>
              <h2 className="text-center mb-4">Créer une nouvelle demande</h2>

              {successMessage && (
                <Alert variant="success">
                  {successMessage} <strong>{countdown}</strong>...
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="animated fadeIn"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Agent</Form.Label>
                      <Form.Select
                        value={agentId}
                        onChange={(e) => setAgentId(e.target.value)}
                        required
                        className="animated fadeIn"
                      >
                        <option value="">Sélectionner un agent</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.nom}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <h4 className="mt-4">Lignes de demande</h4>
                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Quantité</th>
                      <th>Observation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignes.map((ligne, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Select
                            value={ligne.articleId}
                            onChange={(e) => updateLigne(index, "articleId", e.target.value)}
                            required
                          >
                            <option value="">Sélectionner un article</option>
                            {articles.map((article) => (
                              <option key={article.id} value={article.id}>
                                {article.designation}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={ligne.quantite}
                            onChange={(e) => updateLigne(index, "quantite", e.target.value)}
                            min="1"
                            required
                          />
                          {errors[index] && <small className="text-danger">{errors[index]}</small>}
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            value={ligne.observation}
                            onChange={(e) => updateLigne(index, "observation", e.target.value)}
                          />
                        </td>
                        <td>
                          <Button variant="danger" onClick={() => removeLigne(index)}>
                            <FaTrash /> Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <Button
                  variant="outline-primary"
                  className="mb-3"
                  onClick={addLigne}
                  style={{ animation: "fadeIn 1s ease-in-out" }}
                >
                  <FaPlus /> Ajouter une ligne
                </Button>
                <Button variant="success" type="submit" className="mt-3 w-100">
                  {successMessage ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Créer la demande"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Custom CSS */}
      <style>
        {`
          .fadeIn {
            animation: fadeIn 1s ease;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .table th,
          .table td {
            vertical-align: middle;
          }

          .btn-outline-primary:hover {
            background-color: #0069d9;
            color: white;
          }

          .card {
            border-radius: 15px;
          }

          .btn-danger {
            transition: background-color 0.3s ease;
          }

          .btn-danger:hover {
            background-color: #dc3545;
            color: white;
          }
        `}
      </style>
    </Container>
  );

};

export default CreateDemande;
