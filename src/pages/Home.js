import React from "react";
import logo from "../assets/logo.png";
import { Container, Row, Col } from "react-bootstrap";

const Home = () => {
  return (
    <Container fluid className="d-flex justify-content-center align-items-center text-center px-3" style={{ minHeight: "60vh" }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={6} className="mx-auto">
          <img
            src={logo}
            alt="ANDZOA Logo"
            className="img-fluid mb-4"
            style={{ maxWidth: "200px", height: "auto" }}
          />
          <h2 className="mb-3 fw-bold">Bienvenue sur notre plateforme</h2>
          <p className="lead text-muted">
            Cette plateforme vous permet de créer et gérer vos demandes en toute simplicité.
            Accédez à vos informations, suivez vos demandes et interagissez avec notre équipe en temps réel.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
