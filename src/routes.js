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
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ModernDashboard from "./pages/Admin/ModernDashboard";
import MuiLayout from "./pages/Admin/MuiLayout";
import ProfileEdit from "./pages/ProfileEdit";
import ChangePassword from './pages/ChangePassword';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<MuiLayout children={<Profile />} />} />
      <Route path="/profile/password" element={<MuiLayout children={<ChangePassword />} />} />
      <Route path="/profile/edit" element={<MuiLayout children={<ProfileEdit />} />} />
      <Route path="/articles" element={<MuiLayout children={<ArticleList />} />} />
      <Route path="/articles/create" element={<MuiLayout children={<CreateArticle />} />} />
      <Route path="/demandes/create" element={<MuiLayout children={<CreateDemande />} />} />
      <Route path="/demandes" element={<MuiLayout children={<MesDemandes />} />} />
      <Route path="/demande/details/:id" element={<MuiLayout children={<DemandeDetails />} />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/mui-layout" element={<MuiLayout />} />
      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route path="/types" element={<MuiLayout children={<TypeList />} />} />
        <Route path="/marques" element={<MuiLayout children={<MarqueList />} />} />
        <Route path="/modeles" element={<MuiLayout children={<ModeleList />} />} />
        <Route path="/materiels" element={<MuiLayout children={<MaterielList />} />} />
        <Route path="/affectations" element={<MuiLayout children={<AffectationMateriel />} />} />
        <Route path="/ajouter-materiel" element={<MuiLayout children={<AjouterMateriel />} />} />
        <Route path="/affectations-liste" element={<MuiLayout children={<AffectationsList />} />} />
        <Route path="/admin-dashboard" element={<MuiLayout children={<AdminDashboard />} />} />
        <Route path="/modern-dashboard" element={<MuiLayout children={<ModernDashboard />} />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
