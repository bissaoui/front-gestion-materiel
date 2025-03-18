import React from "react";
import logo from "../assets/logo.png"; // Ensure the logo path is correct

const Home = () => {
  return (
    <div 
      className="container-fluid d-flex justify-content-center align-items-center text-center px-3"
      style={{ minHeight: "60vh" }} // Increased minHeight for better centering
    >
      <div className="col-12 col-md-8 col-lg-6"> 
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
      </div>
    </div>
  );
};

export default Home;
