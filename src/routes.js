import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";
import ArticleList from "./pages/Article/ArticleList";
import CreateArticle from "./pages/Article/CreateArticle";
import CreateDemande from "./pages/Demandes/CreateDemande";
import MesDemandes from "./pages/Demandes/MesDemandes";
import DemandeDetails from "./pages/Demandes/DetailsDemande";
import TypeList from "./pages/Admin/TypeList";
import MarqueList from "./pages/Admin/MarqueList";
import ModeleList from "./pages/Admin/ModeleList";
import MaterielList from "./pages/Admin/MaterielList";
import AffectationMateriel from "./pages/Admin/AffectationMateriel";
import AjouterMateriel from "./pages/Admin/AjouterMateriel";
import AffectationsList from "./pages/Admin/AffectationsList";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/articles" element={<ArticleList />} />
      <Route path="/articles/create" element={<CreateArticle />} />
      <Route path="/demandes/create" element={<CreateDemande />} />
      <Route path="/demandes" element={<MesDemandes />} />
      <Route path="/demande/details/:id" element={<DemandeDetails />} />
      <Route path="*" element={<NotFound />} />
      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route path="/types" element={<TypeList />} />
        <Route path="/marques" element={<MarqueList />} />
        <Route path="/modeles" element={<ModeleList />} />
        <Route path="/materiels" element={<MaterielList />} />
        <Route path="/affectations" element={<AffectationMateriel />} />
        <Route path="/ajouter-materiel" element={<AjouterMateriel />} />
        <Route path="/affectations-liste" element={<AffectationsList />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
