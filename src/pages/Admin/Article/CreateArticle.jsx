import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../../api/auth";
import { getToken } from "../../../utils/storage";
import { useNavigate } from "react-router-dom";

const CreateArticle = () => {
  const [formData, setFormData] = useState({
    code: "",
    designation: "",
    unite: "",
    qte: "",
  });

  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userToken = getToken();
    if (!userToken) {
      console.error("Aucun token trouvé !");
    }
    setToken(userToken);
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/articles`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Article Created:", response.data);
      setSuccess("Article created successfully!");
      setFormData({ code: "", designation: "", unite: "", qte: "" });
      setError(null);
    } catch (err) {
      console.error("Failed to create article:", err);
      setError(err.response?.data?.message || "Failed to create article. Please try again.");
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Create New Article</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Code</Form.Label>
          <Form.Control
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Désignation</Form.Label>
          <Form.Control
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Unité</Form.Label>
          <Form.Control
            type="text"
            name="unite"
            value={formData.unite}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Quantité</Form.Label>
          <Form.Control
            type="number"
            name="qte"
            value={formData.qte}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="me-2">
          Create Article
        </Button>
        <Button variant="secondary" onClick={() => navigate("/articles")}>
          Retour à la liste
        </Button>
      </Form>
    </Container>
  );
};

export default CreateArticle;
