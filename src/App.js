import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NotFound from "./components/NotFound";

// Bootstrap Imports
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import ArticleList from "./pages/Article/ArticleList";
import CreateArticle from "./pages/Article/CreateArticle";
import CreateDemande from "./pages/Demandes/CreateDemande";
import MesDemandes from "./pages/Demandes/MyDemands";

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
      <div className="row">
        {/* Sidebar: Hidden on small screens (d-none d-lg-block) */}
        {!isLoginPage && isLoggedIn && (
          <div className="col-lg-2 d-none d-lg-block  text-white">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <div className={`${!isLoginPage && isLoggedIn ? "col-lg-9" : "col-12"} p-4`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/articles" element={<ProtectedRoute><ArticleList /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
            <Route path="/articles/create" element={<ProtectedRoute><CreateArticle /></ProtectedRoute>} />
            <Route path="/demandes/create" element={<ProtectedRoute><CreateDemande /></ProtectedRoute>} />
            <Route path="/demandes" element={<ProtectedRoute><MesDemandes /></ProtectedRoute>} />

          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
