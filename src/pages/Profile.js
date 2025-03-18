import React, { useEffect, useState } from "react";
import { Card, Container, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { getToken } from "../utils/storage";
 // Importer la fonction getToken

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken(); // Récupérer le token via notre fonction utilitaire

    if (!token) {
      console.error("Aucun token trouvé !");
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const cin = decodedToken.cin;

      if (!cin) {
        console.error("CIN non trouvé dans le token !");
        setLoading(false);
        return;
      }

      axios
        .get(`http://localhost:8081/api/agents/${cin}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des données:", error);
          setLoading(false);
        });
    } catch (error) {
      console.error("Erreur lors du décodage du token:", error);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="text-center mt-5">
        <h3 className="text-danger">Utilisateur non trouvé</h3>
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center mt-5">
      <Card className="shadow-lg w-75">
        <Card.Body>
          <h2 className="text-center mb-4">User Profile</h2>

          <Row className="text-center">
            <Col>
              <i className="bi bi-person-circle display-1"></i>
              <h4 className="mt-2">{user.name}</h4>
              <p className="text-muted">{user.role}</p>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col md={6}>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>CIN:</strong> {user.cin}</p>
              <p><strong>Poste:</strong> {user.poste || "N/A"}</p>
            </Col>
            <Col md={6}>
              <p><strong>Direction ID:</strong> {user.directionId || "N/A"}</p>
              <p><strong>Département ID:</strong> {user.departementId || "N/A"}</p>
              <p><strong>Service ID:</strong> {user.serviceId || "N/A"}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
