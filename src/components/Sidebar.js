import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../utils/storage";
import { Navbar, Nav, Button, Offcanvas, Container } from "react-bootstrap";

const Sidebar = () => {
  const { isLoggedIn, logout } = useAuth();
  const token = getToken();

  if (!isLoggedIn || !token) return null;

  let role = "user";
  try {
    const decoded = jwtDecode(token);
    role = decoded.role;
  } catch (error) {
    console.error("Invalid token", error);
  }

  return (
    <>
      {/* Mobile Navbar with Offcanvas Sidebar */}
      <Navbar bg="dark" variant="dark" expand={false} className="d-lg-none">
        <Container fluid>
          <Navbar.Brand className="text-white">Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasSidebar" />
          <Navbar.Offcanvas id="offcanvasSidebar" placement="start" className="bg-dark text-white">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Dashboard</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column">
                <Nav.Link as={Link} to="/" className="text-white">Home</Nav.Link>
                {role === "ADMIN" && (
                  <>
                    <Nav.Link as={Link} to="/utilisateur" className="text-white">Utilisateurs</Nav.Link>
                    <Nav.Link as={Link} to="/demandes" className="text-white">Demandes</Nav.Link>
                    <Nav.Link as={Link} to="/departements" className="text-white">Départements</Nav.Link>
                    <Nav.Link as={Link} to="/services" className="text-white">Services</Nav.Link>
                    <Nav.Link as={Link} to="/articles" className="text-white">Articles</Nav.Link>
                  </>
                )}
                <Nav.Link as={Link} to="/cree-demande" className="text-white">Créer Demande</Nav.Link>
                <Nav.Link as={Link} to="/mes-demandes" className="text-white">Mes Demandes</Nav.Link>
                <Nav.Link as={Link} to="/settings" className="text-white">Settings</Nav.Link>
                <Nav.Link as={Link} to="/profile" className="text-white">Profile</Nav.Link>
                <Button variant="danger" className="mt-3 w-100" onClick={logout}>Logout</Button>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>

      {/* Fixed Sidebar for Large Screens */}
      <div className="d-none d-lg-block sidebar">
        <h4 className="mb-4 text-center">Dashboard</h4>
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/" className="text-white">Home</Nav.Link>
          {role === "ADMIN" && (
            <>
              <Nav.Link as={Link} to="/utilisateur" className="text-white">Utilisateurs</Nav.Link>
              <Nav.Link as={Link} to="/demandes" className="text-white">Demandes</Nav.Link>
              <Nav.Link as={Link} to="/departements" className="text-white">Départements</Nav.Link>
              <Nav.Link as={Link} to="/services" className="text-white">Services</Nav.Link>
              <Nav.Link as={Link} to="/articles" className="text-white">Articles</Nav.Link>
            </>
          )}
          <Nav.Link as={Link} to="/cree-demande" className="text-white">Créer Demande</Nav.Link>
          <Nav.Link as={Link} to="/mes-demandes" className="text-white">Mes Demandes</Nav.Link>
          <Nav.Link as={Link} to="/settings" className="text-white">Settings</Nav.Link>
          <Nav.Link as={Link} to="/profile" className="text-white">Profile</Nav.Link>
          <Button variant="danger" className="mt-3 w-100" onClick={logout}>Logout</Button>
        </Nav>
      </div>

      {/* Styles for Sidebar */}
      <style>
        {`
          .sidebar {
            background-color: #212529;
            color: white;
            height: 100vh;
            width: 250px;
            position: fixed;
            top: 0;
            left: 0;
            padding: 20px;
          }

          .sidebar .nav-link {
            padding: 10px;
            color: white !important;
          }

          .sidebar .nav-link:hover {
            background-color: #343a40;
          }
        `}
      </style>
    </>
  );
};

export default Sidebar;
