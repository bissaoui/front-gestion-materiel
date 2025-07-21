import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { login as authLogin } from "../api/auth";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  // ✅ Prevent rendering if already logged in
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/profile", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await authLogin(credentials);
      if (token) {
        auth.login(token);
        navigate("/profile", { replace: true });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={6} lg={4} xl={3}>
          <Form onSubmit={handleLogin} className="p-4 border rounded shadow-sm bg-white">
            <h2 className="mb-3 text-center">Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Username"
                value={credentials.username}
                onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Control
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Login"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
