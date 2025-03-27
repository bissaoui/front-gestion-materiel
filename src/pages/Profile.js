import React, { useEffect, useState } from "react";
import { Card, Container, Row, Col, Spinner, Button } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../utils/storage";
import  {API_URL}  from "../api/auth";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
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
        .get(`${API_URL}/api/agents/cin/${cin}`, {
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
      <Container className="text-center">
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
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "600px" }}>
        <Card.Body className="text-center">
          <i className="bi bi-person-circle display-1 text-primary"></i>
          <h2 className="mt-3">{user.name}</h2>
          <p className="text-muted">{user.role}</p>
          <hr />

          <Row>
            <Col xs={12} className="mb-3">
              <strong>Username:</strong> {user.username}
            </Col>
            <Col xs={12} className="mb-3">
              <strong>CIN:</strong> {user.cin}
            </Col>
            <Col xs={12} className="mb-3">
              <strong>Poste:</strong> {user.poste || "N/A"}
            </Col>
            <Col xs={12} className="mb-3">
              <strong>Direction:</strong> {user.directionName || "N/A"}
            </Col>
            {user.serviceName && (
              <Col xs={12} className="mb-3">
                <strong>Service:</strong> {user.serviceName}
              </Col>
            )}
            {user.departementName && (
              <Col xs={12} className="mb-3">
                <strong>Département:</strong> {user.departementName}
              </Col>
            )}
          </Row>
          <Button variant="primary" className="mt-3 w-100">Modifier les informations</Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
