import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div 
      className="container-fluid d-flex justify-content-center align-items-center text-center px-3"
      style={{ minHeight: "60vh" }} // Increased height for better centering
    >
      <div className="col-12 col-md-8 col-lg-6">
        <h1 className="mb-3 text-danger fw-bold">404 - Page Introuvable</h1>
        <p className="mb-4 text-muted">
          Oups ! La page que vous recherchez n'existe pas.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">Retour à l'Accueil</Link>
      </div>
    </div>
  );
};

export default NotFound;
