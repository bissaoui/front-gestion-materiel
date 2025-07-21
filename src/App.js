import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes";

// Bootstrap Imports
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </Router>
  );
};

const MainApp = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        {/* Sidebar: Hidden on small screens, Offcanvas handled in Sidebar.js */}
        {!isLoginPage && isLoggedIn && (
          <div className="col-lg-2 d-none d-lg-block px-0">
            <Sidebar />
          </div>
        )}
        {/* Main Content */}
        <div className={
          !isLoginPage && isLoggedIn
            ? "col-12 col-lg-10 p-3 p-md-4"
            : "col-12 p-3 p-md-4"
        }>
          <AppRoutes />
        </div>
      </div>
    </div>
  );
};

export default App;
