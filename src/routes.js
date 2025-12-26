import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import NotFound from "./components/NotFound";
import ArticleList from "./pages/Admin/Article/ArticleList";
import CreateArticle from "./pages/Admin/Article/CreateArticle";
import CreateDemande from "./pages/Admin/Demandes/CreateDemande";
import MesDemandes from "./pages/Admin/Demandes/MesDemandes";
import DemandeDetails from "./pages/Admin/Demandes/DetailsDemande";
import TypeList from "./pages/Admin/Models_Marque_Type/TypeList";
import MarqueList from "./pages/Admin/Models_Marque_Type/MarqueList";
import ModeleList from "./pages/Admin/Models_Marque_Type/ModeleList";
import MaterielList from "./pages/Admin/Materiel/MaterielList";
import AffectationMateriel from "./pages/Admin/Materiel/AffectationMateriel";
import AjouterMateriel from "./pages/Admin/Materiel/AjouterMateriel";
import AffectationsList from "./pages/Admin/Materiel/AffectationsList";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import ModernDashboard from "./pages/Admin/Dashboard/ModernDashboard";
import MuiLayout from "./pages/Admin/MuiLayout";
import ProfileEdit from "./pages/ProfileEdit";
import ChangePassword from './pages/ChangePassword';
import AgentForm from "./pages/Admin/Agents/AgentForm";
import AgentsList from "./pages/Admin/Agents/AgentsList";
import MarcheList from "./pages/Admin/Marche/MarcheList";
import PrestataireList from "./pages/Admin/Prestataire/PrestataireList";
import BesoinsExprimes from "./pages/User/BesoinsExprimes";
import BesoinsExprimesAdmin from "./pages/Admin/BesoinsExprimes/BesoinsExprimesAdmin";
import LayoutWrapper from "./components/LayoutWrapper";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      
      {/* Routes communes (utilisent LayoutWrapper pour choisir le bon layout) */}
      <Route path="/profile" element={<LayoutWrapper><Profile /></LayoutWrapper>} />
      <Route path="/profile/password" element={<LayoutWrapper><ChangePassword /></LayoutWrapper>} />
      <Route path="/profile/edit" element={<LayoutWrapper><ProfileEdit /></LayoutWrapper>} />
      <Route path="/demandes/create" element={<LayoutWrapper><CreateDemande /></LayoutWrapper>} />
      <Route path="/demandes" element={<LayoutWrapper><MesDemandes /></LayoutWrapper>} />
      <Route path="/demande/details/:id" element={<LayoutWrapper><DemandeDetails /></LayoutWrapper>} />
      <Route path="/besoins-exprimes" element={<LayoutWrapper><BesoinsExprimes /></LayoutWrapper>} />

      {/* Routes Admin uniquement */}
      <Route path="/articles" element={<MuiLayout children={<ArticleList />} />} />
      <Route path="/articles/create" element={<MuiLayout children={<CreateArticle />} />} />
      <Route path="/types" element={<MuiLayout children={<TypeList />} />} />
      <Route path="/marques" element={<MuiLayout children={<MarqueList />} />} />
      <Route path="/modeles" element={<MuiLayout children={<ModeleList />} />} />
      <Route path="/materiels" element={<MuiLayout children={<MaterielList />} />} />
      <Route path="/marches" element={<MuiLayout children={<MarcheList />} />} />
      <Route path="/prestataires" element={<MuiLayout children={<PrestataireList />} />} />
      <Route path="/affectations" element={<MuiLayout children={<AffectationMateriel />} />} />
      <Route path="/ajouter-materiel" element={<MuiLayout children={<AjouterMateriel />} />} />
      <Route path="/affectations-liste" element={<MuiLayout children={<AffectationsList />} />} />
      <Route path="/admin-dashboard" element={<MuiLayout children={<AdminDashboard />} />} />
      <Route path="/modern-dashboard" element={<MuiLayout children={<ModernDashboard />} />} />
      <Route path="/agents" element={<MuiLayout children={<AgentsList />} />} />
      <Route path="/agents/create" element={<MuiLayout children={<AgentForm />} />} />
      <Route path="/admin/besoins-exprimes" element={<MuiLayout children={<BesoinsExprimesAdmin />} />} />

      <Route path="/mui-layout" element={<MuiLayout />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
