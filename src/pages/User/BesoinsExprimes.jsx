import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Autocomplete,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { API_URL } from '../../api/auth';
import { getToken } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

const BesoinsExprimes = () => {
  const { user: userFromAuth } = useAuth();
  const [user, setUser] = useState(null);
  const [besoins, setBesoins] = useState([]);
  const [filteredBesoins, setFilteredBesoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewingBesoin, setViewingBesoin] = useState(null);
  const [editingBesoin, setEditingBesoin] = useState(null);
  const [agents, setAgents] = useState([]);
  const [types, setTypes] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    agent: null,
    typeMateriel: null,
    dateBesoin: new Date().toISOString().slice(0, 10),
    raison: '',
    observation: '',
    statut: 'CRÉÉ'
  });

  // Postes autorisés pour valider
  const postesSuperieurs = ['directeur', 'chef de service', 'chef de département', 'Directeur', 'Chef de service', 'Chef de département'];

  // Déclarer les fonctions de vérification avant filterBesoinsByTab
  const isDirecteurDAF = () => {
    if (!user || !user.poste) return false;
    
    // Vérifier que le poste est "directeur"
    const posteLower = user.poste.toLowerCase().trim();
    const isDirecteur = posteLower === 'directeur' || posteLower.includes('directeur');
    
    if (!isDirecteur) return false;
    
    // Vérifier que la direction est DAF (Direction Administrative et Financière)
    const directionName = user.directionName || user.direction || '';
    const directionLower = typeof directionName === 'string' ? directionName.toLowerCase() : '';
    
    // Vérifier si la direction contient "daf", "administratif et financier", "administrative et financière", etc.
    const isDAF = directionLower.includes('daf') || 
                  directionLower.includes('administratif et financier') ||
                  directionLower.includes('administrative et financière') ||
                  directionLower.includes('administratif financier') ||
                  directionLower.includes('administrative financière') ||
                  (directionLower.includes('administratif') && directionLower.includes('financier')) ||
                  (directionLower.includes('administrative') && directionLower.includes('financière'));
    
    // Log pour debug
    if (isDirecteur && !isDAF) {
      console.log('⚠️ Directeur détecté mais pas DAF:', {
        poste: user.poste,
        direction: directionName,
        directionLower: directionLower
      });
    }
    
    return isDAF;
  };

  const isSuperieur = () => {
    if (!user || !user.poste) return false;
    
    const posteLower = user.poste.toLowerCase();
    
    // Le directeur DAF peut aussi être un supérieur et valider les besoins de ses subordonnés
    // Donc on l'inclut dans la liste des supérieurs
    const isDirecteurDAFUser = isDirecteurDAF();
    const isOtherSuperieur = postesSuperieurs.some(poste => posteLower.includes(poste.toLowerCase()));
    
    return isDirecteurDAFUser || isOtherSuperieur;
  };

  const isAdmin = () => {
    if (!user) return false;
    return user.role === 'ADMIN' || userFromAuth?.role === 'ADMIN';
  };

  // Fonction pour déterminer qui est le supérieur direct d'un agent
  // La hiérarchie est : Agent → Chef de service → Chef de département → Directeur
  // Mais un agent peut avoir n'importe lequel comme supérieur direct selon sa structure
  const getSuperieurDirect = (agentBesoin) => {
    if (!agentBesoin) return null;
    
    const agentService = agentBesoin.serviceId || agentBesoin.service;
    const agentDepartement = agentBesoin.departementId || agentBesoin.departement;
    const agentDirection = agentBesoin.directionId || agentBesoin.direction;
    
    const agentServiceId = typeof agentService === 'object' ? agentService?.id : agentService;
    const agentDeptId = typeof agentDepartement === 'object' ? agentDepartement?.id : agentDepartement;
    const agentDirId = typeof agentDirection === 'object' ? agentDirection?.id : agentDirection;
    
    // Priorité 1 : Si l'agent a un service, chercher le chef de service de ce service
    if (agentServiceId) {
      const chefService = agents.find(a => {
        const aPoste = a.poste?.toLowerCase() || '';
        const aService = a.serviceId || a.service;
        const aServiceId = typeof aService === 'object' ? aService?.id : aService;
        return (aPoste.includes('chef de service') || aPoste.includes('chef service')) &&
               Number(aServiceId) === Number(agentServiceId);
      });
      if (chefService) return { type: 'chef de service', agent: chefService };
    }
    
    // Priorité 2 : Si l'agent a un département (et pas de chef de service trouvé), 
    // chercher le chef de département de ce département
    if (agentDeptId) {
      const chefDepartement = agents.find(a => {
        const aPoste = a.poste?.toLowerCase() || '';
        const aDepartement = a.departementId || a.departement;
        const aDeptId = typeof aDepartement === 'object' ? aDepartement?.id : aDepartement;
        return (aPoste.includes('chef de département') || aPoste.includes('chef département')) &&
               Number(aDeptId) === Number(agentDeptId);
      });
      if (chefDepartement) return { type: 'chef de département', agent: chefDepartement };
    }
    
    // Priorité 3 : Si l'agent a une direction (et pas de chef de département trouvé),
    // chercher le directeur de cette direction
    if (agentDirId) {
      const directeur = agents.find(a => {
        const aPoste = a.poste?.toLowerCase() || '';
        const aDirection = a.directionId || a.direction;
        const aDirId = typeof aDirection === 'object' ? aDirection?.id : aDirection;
        return (aPoste === 'directeur' || aPoste.includes('directeur')) &&
               Number(aDirId) === Number(agentDirId);
      });
      if (directeur) return { type: 'directeur', agent: directeur };
    }
    
    return null;
  };

  // Fonction pour vérifier si l'utilisateur actuel est le supérieur direct d'un agent
  const isSuperieurDirect = (agentBesoin) => {
    if (!user || !agentBesoin) return false;
    
    const superieurDirect = getSuperieurDirect(agentBesoin);
    if (!superieurDirect) return false;
    
    const userId = user.id || user.userId;
    const superieurId = superieurDirect.agent?.id || superieurDirect.agent?.userId;
    
    return Number(userId) === Number(superieurId);
  };

  // Déclarer filterBesoinsByTab avant les useEffect qui l'utilisent
  const filterBesoinsByTab = useCallback(() => {
    if (!user) {
      console.log('⚠️ Filtrage annulé - user non défini');
      return;
    }
    
    if (!Array.isArray(besoins) || besoins.length === 0) {
      console.log('⚠️ Filtrage annulé - besoins vides ou non chargés');
      setFilteredBesoins([]);
      return;
    }
    
    if (!Array.isArray(agents) || agents.length === 0) {
      console.log('⚠️ Filtrage annulé - agents non chargés');
      setFilteredBesoins([]);
      return;
    }

    let filtered = [];
    const userId = user.id || user.userId;
    const hasValidateTab = isSuperieur();
    const hasViseTab = isDirecteurDAF();
    const hasAdminTab = isAdmin();

    // Calculer l'index réel de l'onglet selon les onglets disponibles
    let realTabIndex = 0;
    
    if (currentTab === 0) {
      realTabIndex = 0; // Mes besoins
    } else if (currentTab === 1) {
      if (hasValidateTab) {
        realTabIndex = 1; // À valider
      } else if (hasViseTab) {
        realTabIndex = 2; // À viser
      } else if (hasAdminTab) {
        realTabIndex = 3; // À accepter/refuser
      } else {
        realTabIndex = 4; // Déjà validé
      }
    } else if (currentTab === 2) {
      if (hasValidateTab && hasViseTab) {
        realTabIndex = 2; // À viser
      } else if (hasValidateTab && hasAdminTab) {
        realTabIndex = 3; // À accepter/refuser
      } else if (hasViseTab && hasAdminTab) {
        realTabIndex = 3; // À accepter/refuser
      } else if (hasValidateTab) {
        realTabIndex = 4; // Déjà validé
      } else {
        realTabIndex = 4; // Déjà validé
      }
    } else if (currentTab === 3) {
      if (hasValidateTab && hasViseTab && hasAdminTab) {
        realTabIndex = 3; // À accepter/refuser
      } else if (hasValidateTab && hasViseTab) {
        realTabIndex = 4; // Déjà validé
      } else if (hasValidateTab && hasAdminTab) {
        realTabIndex = 4; // Déjà validé
      } else {
        realTabIndex = 4; // Déjà validé
      }
    } else if (currentTab === 4) {
      realTabIndex = 4; // Déjà validé
    } else {
      realTabIndex = 4; // Déjà validé
    }

    // Filtrer selon l'index réel
    if (realTabIndex === 0) {
      // Mes besoins - uniquement les besoins créés par l'utilisateur actuel
      filtered = besoins.filter(b => {
        // Récupérer l'agent du besoin
        let agentBesoin = b.agent;
        if (!agentBesoin && b.agentId) {
          agentBesoin = agents.find(a => a.id === b.agentId);
        }
        
        const agentId = agentBesoin?.id || b.agentId;
        const matches = Number(agentId) === Number(userId);
        
        console.log('🔍 Mes besoins - Besoin:', b.id, {
          agentId: agentId,
          userId: userId,
          agentNom: agentBesoin?.nom || agentBesoin?.username || 'N/A',
          matches
        });
        
        // S'assurer que les IDs sont comparés comme des nombres
        return matches;
      });
    } else if (realTabIndex === 1 && hasValidateTab) {
      // À valider - utiliser la même logique que canValidate() pour filtrer selon la hiérarchie
      filtered = besoins.filter(b => {
        if (b.statut !== 'CRÉÉ') {
          console.log('🔍 Besoin filtré (statut):', b.id, 'statut:', b.statut);
          return false;
        }
        
        const userPoste = user.poste?.toLowerCase() || '';
        const userDirection = user.directionId || user.direction;
        const userDepartement = user.departementId || user.departement;
        const userService = user.serviceId || user.service;
        
        // Récupérer l'agent du besoin
        let agentBesoin = b.agent;
        if (!agentBesoin && b.agentId) {
          agentBesoin = agents.find(a => a.id === b.agentId);
        }
        
        if (!agentBesoin) {
          console.log('🔍 Besoin filtré (agent non trouvé):', b.id, 'agentId:', b.agentId);
          return false;
        }
        
        // Exclure les besoins créés par l'utilisateur lui-même
        const agentBesoinId = agentBesoin.id || b.agentId;
        if (Number(agentBesoinId) === Number(userId)) {
          console.log('🔍 Besoin filtré (créé par utilisateur):', b.id);
          return false;
        }
        
        // Utiliser la fonction isSuperieurDirect pour vérifier si l'utilisateur est le supérieur direct
        const matches = isSuperieurDirect(agentBesoin);
        console.log('🔍 Vérification supérieur direct - Besoin:', b.id, {
          agentNom: agentBesoin.nom || agentBesoin.username,
          agentPoste: agentBesoin.poste,
          userPoste: userPoste,
          matches
        });
        return matches;
        
        console.log('🔍 Besoin filtré (aucune condition match):', b.id);
        return false;
      });
    } else if (realTabIndex === 2 && hasViseTab) {
      // À viser - besoins en statut VALIDATION (seul le directeur DAF peut voir cette tab)
      filtered = besoins.filter(b => {
        const matches = b.statut === 'VALIDATION';
        console.log('🔍 À viser - Besoin:', b.id, {
          statut: b.statut,
          matches
        });
        return matches;
      });
    } else if (realTabIndex === 3 && hasAdminTab) {
      // À accepter/refuser (pour admin) - besoins en statut VISA
      filtered = besoins.filter(b => b.statut === 'VISA');
    } else if (realTabIndex === 4) {
      // Déjà validé - besoins que l'utilisateur actuel a validés, visés, acceptés ou refusés
      filtered = besoins.filter(b => {
        const userId = user.id || user.userId;
        
        // Récupérer les IDs des validateurs/viseurs/decideurs
        const validateurId = b.validateur?.id || b.validateurId;
        const viseurId = b.viseur?.id || b.viseurId;
        const decideurId = b.decideur?.id || b.decideurId;
        
        // Vérifier si l'utilisateur actuel est le validateur, le viseur ou le décideur
        const isValidatedByUser = validateurId && Number(validateurId) === Number(userId);
        const isVisedByUser = viseurId && Number(viseurId) === Number(userId);
        const isDecidedByUser = decideurId && Number(decideurId) === Number(userId);
        
        // Le besoin doit être dans un statut validé ET avoir été validé/visé/décidé par l'utilisateur actuel
        const isValidatedStatus = b.statut === 'VALIDATION' || 
                                  b.statut === 'VISA' || 
                                  b.statut === 'ACCEPTÉ' || 
                                  b.statut === 'REFUSÉ';
        
        return isValidatedStatus && (isValidatedByUser || isVisedByUser || isDecidedByUser);
      });
    } else {
      filtered = [];
    }

    console.log('✅ Filtrage terminé - Tab:', realTabIndex, 'Résultat:', filtered.length, 'besoins');
    console.log('📊 État filteredBesoins avant setState:', filtered.map(b => ({ id: b.id, agentId: b.agent?.id || b.agentId, statut: b.statut })));
    setFilteredBesoins(filtered);
  }, [user, besoins, currentTab, agents]);

  // Calculer les compteurs pour les badges
  const countMesBesoins = useMemo(() => {
    if (!user || !Array.isArray(besoins) || besoins.length === 0 || !Array.isArray(agents) || agents.length === 0) return 0;
    const userId = user.id || user.userId;
    return besoins.filter(b => {
      let agentBesoin = b.agent;
      if (!agentBesoin && b.agentId) {
        agentBesoin = agents.find(a => a.id === b.agentId);
      }
      const agentId = agentBesoin?.id || b.agentId;
      return Number(agentId) === Number(userId);
    }).length;
  }, [user, besoins, agents]);

  const countAValider = useMemo(() => {
    if (!user || !isSuperieur() || !Array.isArray(besoins) || besoins.length === 0 || !Array.isArray(agents) || agents.length === 0) return 0;
    const userId = user.id || user.userId;
    const userPoste = user.poste?.toLowerCase() || '';
    const userDirection = user.directionId || user.direction;
    const userDepartement = user.departementId || user.departement;
    const userService = user.serviceId || user.service;
    
    return besoins.filter(b => {
      if (b.statut !== 'CRÉÉ') return false;
      
      let agentBesoin = b.agent;
      if (!agentBesoin && b.agentId) {
        agentBesoin = agents.find(a => a.id === b.agentId);
      }
      
      if (!agentBesoin) return false;
      
      const agentBesoinId = agentBesoin.id || b.agentId;
      if (Number(agentBesoinId) === Number(userId)) return false;
      
      // Utiliser la fonction isSuperieurDirect pour vérifier si l'utilisateur est le supérieur direct
      return isSuperieurDirect(agentBesoin);
      
      return false;
    }).length;
  }, [user, besoins, agents]);

  useEffect(() => {
    fetchUserDetails();
    fetchAgents();
    fetchTypes();
  }, []);

  useEffect(() => {
    // Charger les besoins après avoir chargé les agents et types
    if (agents.length > 0 && types.length > 0) {
      fetchBesoins();
    }
  }, [agents.length, types.length]);

  useEffect(() => {
    // Filtrer les besoins quand ils changent, quand l'onglet change, ou quand les agents sont chargés
    if (user && Array.isArray(besoins) && Array.isArray(agents) && agents.length > 0) {
      console.log('🔄 Filtrage des besoins - Tab:', currentTab, 'Besoins:', besoins.length, 'Agents:', agents.length);
      filterBesoinsByTab();
    }
  }, [besoins, currentTab, user, agents.length, filterBesoinsByTab]);

  const fetchUserDetails = async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const { jwtDecode } = await import('jwt-decode');
      const decoded = jwtDecode(token);
      const cin = decoded.cin;
      
      if (cin) {
        const response = await axios.get(`${API_URL}/api/agents/cin/${cin}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } else {
        setUser(userFromAuth);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des détails utilisateur:', err);
      setUser(userFromAuth);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/agents`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setAgents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des agents:', err);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/types`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setTypes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des types:', err);
    }
  };

  const fetchBesoins = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/besoins-exprimes`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        params: { page: 0, size: 1000 } // Récupérer tous les besoins pour le moment
      });
      // Le backend retourne une Page, on extrait le contenu
      const besoinsData = response.data.content || response.data;
      const besoinsArray = Array.isArray(besoinsData) ? besoinsData : [];
      
      // Enrichir les besoins avec les données des agents et types si nécessaire
      const besoinsEnriched = besoinsArray.map(besoin => {
        // Si l'agent n'est pas complètement chargé, chercher dans la liste des agents
        if (besoin.agent && (!besoin.agent.nom && !besoin.agent.username) && besoin.agent.id) {
          const agentComplet = agents.find(a => a.id === besoin.agent.id);
          if (agentComplet) {
            besoin.agent = { ...besoin.agent, ...agentComplet };
          }
        }
        
        // Si le type de matériel n'est pas complètement chargé, chercher dans la liste des types
        if (besoin.typeMateriel && !besoin.typeMateriel.nom && besoin.typeMateriel.id) {
          const typeComplet = types.find(t => t.id === besoin.typeMateriel.id);
          if (typeComplet) {
            besoin.typeMateriel = { ...besoin.typeMateriel, ...typeComplet };
          }
        }
        
        return besoin;
      });
      
      console.log('📥 Besoins chargés:', besoinsEnriched.length);
      setBesoins(besoinsEnriched);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des besoins');
      setBesoins([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBesoinsAValider = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/besoins-exprimes/a-valider`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error('Erreur lors du chargement des besoins à valider:', err);
      return [];
    }
  };

  const fetchBesoinsAViser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/besoins-exprimes/a-viser`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error('Erreur lors du chargement des besoins à viser:', err);
      return [];
    }
  };

  const handleOpenDialog = (besoin = null) => {
    const today = new Date().toISOString().slice(0, 10);
    if (besoin) {
      setEditingBesoin(besoin);
      setFormData({
        agent: besoin.agent || null,
        typeMateriel: besoin.typeMateriel || null,
        dateBesoin: besoin.dateBesoin ? besoin.dateBesoin.split('T')[0] : today,
        raison: besoin.raison || '',
        observation: besoin.observation || '',
        statut: besoin.statut || 'CRÉÉ'
      });
    } else {
      setEditingBesoin(null);
      const userId = user?.id || user?.userId;
      const currentAgent = agents.find(a => a.id === userId);
      setFormData({
        agent: currentAgent || null,
        typeMateriel: null,
        dateBesoin: today, // Toujours fixé à aujourd'hui
        raison: '',
        observation: '',
        statut: 'CRÉÉ'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBesoin(null);
    const today = new Date().toISOString().slice(0, 10);
    const userId = user?.id || user?.userId;
    const currentAgent = agents.find(a => a.id === userId);
    setFormData({
      agent: currentAgent || null,
      typeMateriel: null,
      dateBesoin: today, // Toujours fixé à aujourd'hui
      raison: '',
      observation: '',
      statut: 'CRÉÉ'
    });
  };

  const handleViewBesoin = (besoin) => {
    setViewingBesoin(besoin);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingBesoin(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.agent || !formData.typeMateriel || !formData.dateBesoin || !formData.raison.trim()) {
      setError('L\'agent, le type de matériel, la date de besoin et la raison sont obligatoires');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        agentId: formData.agent.id,
        typeMaterielId: formData.typeMateriel.id,
        dateBesoin: formData.dateBesoin,
        raison: formData.raison,
        observation: formData.observation
      };

      if (editingBesoin) {
        await axios.put(`${API_URL}/api/besoins-exprimes/${editingBesoin.id}`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setSuccess('Besoin modifié avec succès');
      } else {
        // Créer le besoin
        const response = await axios.post(`${API_URL}/api/besoins-exprimes`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        const besoinCree = response.data;
        const besoinId = besoinCree.id;
        
        // Vérifier si l'agent créateur est un directeur
        const agentPoste = formData.agent.poste?.toLowerCase() || '';
        const agentDirection = formData.agent.directionId || formData.agent.direction;
        const directionName = formData.agent.directionName || formData.agent.direction || '';
        const directionLower = typeof directionName === 'string' ? directionName.toLowerCase() : '';
        
        const isDirecteur = agentPoste === 'directeur' || agentPoste.includes('directeur');
        const isDirecteurDAF = isDirecteur && (
          directionLower.includes('daf') || 
          directionLower.includes('administratif et financier') ||
          directionLower.includes('administrative et financière') ||
          directionLower.includes('administratif financier') ||
          directionLower.includes('administrative financière')
        );
        
        // Si c'est un directeur DAF : valider et viser automatiquement
        if (isDirecteurDAF) {
          try {
            // Valider d'abord
            const validationResponse = await axios.put(`${API_URL}/api/besoins-exprimes/${besoinId}/valider`, {}, {
              headers: { Authorization: `Bearer ${getToken()}` }
            });
            
            // Vérifier que le statut est bien VALIDATION avant de viser
            const besoinApresValidation = validationResponse.data;
            if (besoinApresValidation && besoinApresValidation.statut === 'VALIDATION') {
              // Attendre un court délai pour s'assurer que la validation est bien enregistrée
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Puis viser
              await axios.put(`${API_URL}/api/besoins-exprimes/${besoinId}/viser`, {}, {
                headers: { Authorization: `Bearer ${getToken()}` }
              });
              
              setSuccess('Besoin exprimé, validé et visé automatiquement (Directeur DAF)');
            } else {
              console.warn('Le besoin n\'est pas en statut VALIDATION après validation, visa annulé');
              setSuccess('Besoin exprimé et validé automatiquement (Directeur DAF), mais le visa a échoué');
            }
          } catch (autoErr) {
            console.error('Erreur lors de la validation/visa automatique:', autoErr);
            const errorMessage = autoErr.response?.data?.message || autoErr.message || 'Erreur inconnue';
            if (autoErr.response?.status === 400) {
              setError(`Erreur lors de la validation/visa automatique: ${errorMessage}. Le besoin a été créé mais nécessite une validation manuelle.`);
            } else {
              setSuccess(`Besoin exprimé avec succès, mais erreur lors de la validation/visa automatique: ${errorMessage}`);
            }
          }
        } 
        // Si c'est un directeur (mais pas DAF) : valider automatiquement
        else if (isDirecteur) {
          try {
            await axios.put(`${API_URL}/api/besoins-exprimes/${besoinId}/valider`, {}, {
              headers: { Authorization: `Bearer ${getToken()}` }
            });
            setSuccess('Besoin exprimé et validé automatiquement (Directeur)');
          } catch (autoErr) {
            console.error('Erreur lors de la validation automatique:', autoErr);
            setSuccess('Besoin exprimé avec succès, mais erreur lors de la validation automatique');
          }
        } 
        // Sinon, besoin créé normalement
        else {
          setSuccess('Besoin exprimé avec succès');
        }
      }
      handleCloseDialog();
      await fetchBesoins();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (besoin, action) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let endpoint = '';
      let method = 'PUT';
      let data = null;

      switch (action) {
        case 'valider':
          endpoint = `${API_URL}/api/besoins-exprimes/${besoin.id}/valider`;
          break;
        case 'viser':
          // Vérifier que le besoin est bien en statut VALIDATION avant de viser
          if (besoin.statut !== 'VALIDATION') {
            setError('Ce besoin doit être en statut VALIDATION pour être visé');
            setLoading(false);
            return;
          }
          
          // Vérifier que l'utilisateur est bien le directeur DAF
          if (!isDirecteurDAF()) {
            setError('Seul le Directeur DAF peut viser un besoin');
            setLoading(false);
            return;
          }
          
          endpoint = `${API_URL}/api/besoins-exprimes/${besoin.id}/viser`;
          break;
        case 'accepter':
          endpoint = `${API_URL}/api/besoins-exprimes/${besoin.id}/accepter`;
          break;
        case 'refuser':
          endpoint = `${API_URL}/api/besoins-exprimes/${besoin.id}/refuser`;
          data = { motif: '' }; // Optionnel, peut être vide
          break;
        default:
          setLoading(false);
          return;
      }

      const response = await axios.put(endpoint, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      setSuccess(`Besoin ${action === 'valider' ? 'validé' : action === 'viser' ? 'visé' : action === 'accepter' ? 'accepté' : 'refusé'} avec succès`);
      
      // Rafraîchir les besoins après l'action
      await fetchBesoins();
      
      // Le filtrage se fera automatiquement via le useEffect
    } catch (err) {
      console.error(`Erreur lors de l'action ${action}:`, err);
      console.error('Détails de l\'erreur:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        besoin: {
          id: besoin.id,
          statut: besoin.statut,
          agentId: besoin.agent?.id || besoin.agentId,
          agentNom: besoin.agent?.nom || besoin.agent?.username,
          validateurId: besoin.validateur?.id || besoin.validateurId,
          validateurNom: besoin.validateur?.nom || besoin.validateur?.username
        },
        user: {
          id: user?.id || user?.userId,
          username: user?.username,
          poste: user?.poste,
          direction: user?.directionName || user?.direction,
          isDirecteurDAF: isDirecteurDAF()
        },
        action: action
      });
      
      // Le backend ne retourne pas de message d'erreur dans le body (ResponseEntity.badRequest().build())
      // On doit donc construire un message basé sur le contexte
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Erreur lors de l\'action';
      
      if (err.response?.status === 400) {
        // Message d'erreur plus détaillé pour le visa
        if (action === 'viser') {
          // Vérifier si c'est son propre besoin
          const userId = user?.id || user?.userId;
          const agentBesoinId = besoin.agent?.id || besoin.agentId;
          const isOwnBesoin = Number(userId) === Number(agentBesoinId);
          
          // Vérifier si le besoin a été validé par l'utilisateur lui-même
          const validateurId = besoin.validateur?.id || besoin.validateurId;
          const isAutoValidated = validateurId && Number(validateurId) === Number(userId);
          
          let detailedMessage = `Erreur 400 lors du visa du besoin #${besoin.id}`;
          
          if (isOwnBesoin && isAutoValidated) {
            detailedMessage += `\n\n⚠️ Problème détecté: Vous tentez de viser votre propre besoin qui a été auto-validé par vous-même.`;
            detailedMessage += `\n\nLe backend refuse probablement cette action car:\n- Le besoin a été créé par vous (ID: ${agentBesoinId})\n- Le besoin a été validé par vous (ID: ${validateurId})\n- Vous ne pouvez pas viser un besoin que vous avez vous-même validé`;
            detailedMessage += `\n\n💡 Solution: Le besoin doit être validé par un autre supérieur avant de pouvoir être visé.`;
          } else if (isOwnBesoin) {
            detailedMessage += `\n\n⚠️ Vous tentez de viser votre propre besoin.`;
            detailedMessage += `\n\nVérifiez que le besoin a été validé par un autre supérieur.`;
          } else {
            detailedMessage += `\n\nVérifiez que:\n- Le besoin est en statut VALIDATION (actuel: ${besoin.statut})\n- Vous êtes bien le Directeur DAF\n- Le besoin a été correctement validé par un supérieur`;
          }
          
          setError(detailedMessage);
        } else {
          setError(`Erreur 400: ${errorMessage}. Vérifiez que le besoin est dans le bon statut et que vous avez les permissions nécessaires.`);
        }
      } else if (err.response?.status === 403) {
        setError(`Erreur 403: Vous n'avez pas les permissions pour effectuer cette action.`);
      } else if (err.response?.status === 404) {
        setError(`Erreur 404: Le besoin n'a pas été trouvé.`);
      } else {
        setError(`Erreur: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce besoin ?')) return;
    
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_URL}/api/besoins-exprimes/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSuccess('Besoin supprimé avec succès');
      await fetchBesoins();
      await filterBesoinsByTab();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'CRÉÉ': return 'default';
      case 'VALIDATION': return 'info';
      case 'VISA': return 'warning';
      case 'ACCEPTÉ': return 'success';
      case 'REFUSÉ': return 'error';
      default: return 'default';
    }
  };

  const canEdit = (besoin) => {
    if (!user) return false;
    const userId = user.id || user.userId;
    const agentId = besoin.agent?.id || besoin.agentId;
    return agentId === userId && besoin.statut === 'CRÉÉ';
  };

  const canDelete = (besoin) => {
    if (!user) return false;
    const userId = user.id || user.userId;
    const agentId = besoin.agent?.id || besoin.agentId;
    return agentId === userId && besoin.statut === 'CRÉÉ';
  };

  const canValidate = (besoin) => {
    if (!isSuperieur() || besoin.statut !== 'CRÉÉ') return false;
    
    const userId = user.id || user.userId;
    const userPoste = user.poste?.toLowerCase() || '';
    const userDirection = user.directionId || user.direction;
    const userDepartement = user.departementId || user.departement;
    const userService = user.serviceId || user.service;
    
    // Récupérer l'agent du besoin (soit objet, soit ID)
    let agentBesoin = besoin.agent;
    if (!agentBesoin && besoin.agentId) {
      agentBesoin = agents.find(a => a.id === besoin.agentId);
    }
    
    if (!agentBesoin) return false;
    
    // Exclure les besoins créés par l'utilisateur lui-même
    const agentBesoinId = agentBesoin.id || besoin.agentId;
    if (Number(agentBesoinId) === Number(userId)) return false;

    // Utiliser la fonction isSuperieurDirect pour vérifier si l'utilisateur est le supérieur direct
    return isSuperieurDirect(agentBesoin);
    
    return false;
  };

  const canVise = (besoin) => {
    // Seul le directeur DAF peut viser (statut VALIDATION)
    if (!isDirecteurDAF()) return false;
    if (besoin.statut !== 'VALIDATION') return false;
    
    // Vérifier que l'utilisateur ne tente pas de viser son propre besoin
    // (même si c'est techniquement possible, c'est généralement une mauvaise pratique)
    const userId = user.id || user.userId;
    let agentBesoin = besoin.agent;
    if (!agentBesoin && besoin.agentId) {
      agentBesoin = agents.find(a => a.id === besoin.agentId);
    }
    const agentBesoinId = agentBesoin?.id || besoin.agentId;
    
    // Un directeur DAF peut viser n'importe quel besoin validé, même le sien
    // Mais on peut ajouter une vérification si nécessaire
    return true;
  };

  const canAcceptOrRefuse = (besoin) => {
    // Seul l'admin peut accepter/refuser (statut VISA)
    if (!isAdmin()) return false;
    return besoin.statut === 'VISA';
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#1B4C43' }}>
          Besoins exprimés
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: '#A97B2A',
            '&:hover': { bgcolor: '#8B6A1F' }
          }}
        >
          Exprimer un besoin
        </Button>
      </Box>

      {/* Label de test pour afficher l'utilisateur actuel */}
      {user && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 2, 
            bgcolor: '#e3f2fd',
            '& .MuiAlert-message': {
              fontSize: '0.875rem'
            }
          }}
        >
          <Typography variant="body2" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
            👤 Utilisateur actuel (TEST):
          </Typography>
          <Typography variant="body2" component="div">
            <strong>ID:</strong> {user.id || user.userId || 'N/A'} | 
            <strong> Nom:</strong> {user.nom || user.name || 'N/A'} | 
            <strong> Username:</strong> {user.username || 'N/A'} | 
            <strong> Poste:</strong> {user.poste || 'N/A'}
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
            <strong>Direction:</strong> {user.directionName || user.direction || user.directionId || 'N/A'} | 
            <strong> Département:</strong> {user.departementName || user.departement || user.departementId || 'N/A'} | 
            <strong> Service:</strong> {user.serviceName || user.service || user.serviceId || 'N/A'}
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
            <strong>Rôle:</strong> {user.role || 'N/A'} | 
            <strong> Est Supérieur:</strong> {isSuperieur() ? 'Oui' : 'Non'} | 
            <strong> Est Directeur DAF:</strong> {isDirecteurDAF() ? 'Oui' : 'Non'} | 
            <strong> Est Admin:</strong> {isAdmin() ? 'Oui' : 'Non'}
          </Typography>
          {besoins.length > 0 && (
            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <Typography variant="body2" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                📋 Besoins (DEBUG - {besoins.length} total):
              </Typography>
              {besoins.slice(0, 3).map(b => {
                const agentB = b.agent || (b.agentId ? agents.find(a => a.id === b.agentId) : null);
                return (
                  <Typography key={b.id} variant="caption" component="div" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                    <strong>ID:</strong> {b.id} | 
                    <strong> Statut:</strong> {b.statut} | 
                    <strong> Agent:</strong> {agentB ? `${agentB.nom || ''} ${agentB.username || ''}`.trim() : b.agentId || 'N/A'} | 
                    <strong> Agent Service:</strong> {agentB ? (agentB.serviceId || agentB.service || 'N/A') : 'N/A'} | 
                    <strong> User Service:</strong> {user.serviceId || user.service || 'N/A'}
                  </Typography>
                );
              })}
            </Box>
          )}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => {
            setCurrentTab(newValue);
            // Le useEffect se chargera du filtrage automatiquement
          }}
        >
          <Tab 
            label={
              <Badge badgeContent={countMesBesoins} color="primary" sx={{ '& .MuiBadge-badge': { right: -8, top: 8 } }}>
                <Box component="span">Mes besoins</Box>
              </Badge>
            } 
          />
          {isSuperieur() && (
            <Tab 
              label={
                <Badge badgeContent={countAValider} color="error" sx={{ '& .MuiBadge-badge': { right: -8, top: 8 } }}>
                  <Box component="span">À valider</Box>
                </Badge>
              } 
            />
          )}
          {isDirecteurDAF() && <Tab label="À viser" />}
          {isAdmin() && <Tab label="À accepter/refuser" />}
          <Tab label="Déjà validé" />
        </Tabs>
      </Card>

      <Card>
        <CardContent>
          {loading && besoins.length === 0 ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : filteredBesoins.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Aucun besoin trouvé
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ background: '#f4f6fa' }}>
                  <TableRow>
                    <TableCell>Agent</TableCell>
                    <TableCell>Type de matériel</TableCell>
                    <TableCell>Date de besoin</TableCell>
                    <TableCell>Raison</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date création</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBesoins.map((besoin) => {
                      // Récupérer l'agent - gérer les deux cas : objet agent ou agentId
                      let agent = null;
                      if (besoin.agent) {
                        // Si c'est un objet avec id, chercher dans la liste
                        if (besoin.agent.id) {
                          agent = agents.find(a => a.id === besoin.agent.id) || besoin.agent;
                        } else {
                          agent = besoin.agent;
                        }
                      } else if (besoin.agentId) {
                        // Si c'est juste un ID, chercher dans la liste
                        agent = agents.find(a => a.id === besoin.agentId);
                      }
                      
                      // Récupérer le type - gérer les deux cas : objet typeMateriel ou typeMaterielId
                      let typeMateriel = null;
                      if (besoin.typeMateriel) {
                        // Si c'est un objet avec id, chercher dans la liste
                        if (besoin.typeMateriel.id) {
                          typeMateriel = types.find(t => t.id === besoin.typeMateriel.id) || besoin.typeMateriel;
                        } else {
                          typeMateriel = besoin.typeMateriel;
                        }
                      } else if (besoin.typeMaterielId) {
                        // Si c'est juste un ID, chercher dans la liste
                        typeMateriel = types.find(t => t.id === besoin.typeMaterielId);
                      }
                      
                      // Formater le nom de l'agent
                      const agentName = agent 
                        ? `${agent.nom || agent.name || ''} ${agent.username || ''}`.trim() || agent.username || agent.nom || agent.name || '-'
                        : '-';
                      
                      // Formater le nom du type
                      const typeName = typeMateriel?.nom || typeMateriel?.name || '-';
                      
                      return (
                      <TableRow key={besoin.id} hover>
                        <TableCell>
                          {agentName}
                        </TableCell>
                        <TableCell>
                          {typeName}
                        </TableCell>
                        <TableCell>
                          {besoin.dateBesoin ? new Date(besoin.dateBesoin).toLocaleDateString('fr-FR') : '-'}
                        </TableCell>
                        <TableCell>
                          <Tooltip title={besoin.raison}>
                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {besoin.raison}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={besoin.statut || 'CRÉÉ'}
                            color={getStatutColor(besoin.statut)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {besoin.dateCreation ? new Date(besoin.dateCreation).toLocaleDateString('fr-FR') : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Voir les détails">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewBesoin(besoin)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {canEdit(besoin) && (
                            <Tooltip title="Modifier">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(besoin)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canValidate(besoin) && (
                            <Tooltip title="Valider">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleAction(besoin, 'valider')}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canVise(besoin) && (
                            <Tooltip title="Viser">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleAction(besoin, 'viser')}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canAcceptOrRefuse(besoin) && (
                            <>
                              <Tooltip title="Accepter">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleAction(besoin, 'accepter')}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Refuser">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleAction(besoin, 'refuser')}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {canDelete(besoin) && (
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(besoin.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                      );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour créer/modifier un besoin */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Typography variant="h6">
              {editingBesoin ? 'Modifier le besoin' : 'Exprimer un besoin'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Autocomplete
                options={agents}
                getOptionLabel={(option) => `${option.nom || ''} ${option.username || ''}`.trim()}
                value={formData.agent}
                onChange={(e, newValue) => setFormData({ ...formData, agent: newValue })}
                disabled={true}
                renderInput={(params) => (
                  <TextField {...params} label="Agent *" required />
                )}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
              />
              <Autocomplete
                options={types}
                getOptionLabel={(option) => option.nom || ''}
                value={formData.typeMateriel}
                onChange={(e, newValue) => setFormData({ ...formData, typeMateriel: newValue })}
                renderInput={(params) => (
                  <TextField {...params} label="Type de matériel *" required />
                )}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
              />
              <TextField
                label="Date de besoin *"
                type="date"
                value={formData.dateBesoin}
                onChange={(e) => setFormData({ ...formData, dateBesoin: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
                disabled={true}
              />
              <TextField
                label="Raison *"
                value={formData.raison}
                onChange={(e) => setFormData({ ...formData, raison: e.target.value })}
                fullWidth
                multiline
                rows={3}
                required
              />
              <TextField
                label="Observation"
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#A97B2A',
                '&:hover': { bgcolor: '#8B6A1F' }
              }}
            >
              {loading ? <CircularProgress size={24} /> : editingBesoin ? 'Modifier' : 'Exprimer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog pour voir les détails d'un besoin */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Détails du besoin</Typography>
        </DialogTitle>
        <DialogContent>
          {viewingBesoin && (() => {
            // Récupérer l'agent complet
            let agentView = null;
            if (viewingBesoin.agent) {
              if (viewingBesoin.agent.id) {
                agentView = agents.find(a => a.id === viewingBesoin.agent.id) || viewingBesoin.agent;
              } else {
                agentView = viewingBesoin.agent;
              }
            } else if (viewingBesoin.agentId) {
              agentView = agents.find(a => a.id === viewingBesoin.agentId);
            }
            
            // Récupérer le type complet
            let typeView = null;
            if (viewingBesoin.typeMateriel) {
              if (viewingBesoin.typeMateriel.id) {
                typeView = types.find(t => t.id === viewingBesoin.typeMateriel.id) || viewingBesoin.typeMateriel;
              } else {
                typeView = viewingBesoin.typeMateriel;
              }
            } else if (viewingBesoin.typeMaterielId) {
              typeView = types.find(t => t.id === viewingBesoin.typeMaterielId);
            }
            
            const agentName = agentView 
              ? `${agentView.nom || agentView.name || ''} ${agentView.username || ''}`.trim() || agentView.username || agentView.nom || agentView.name || '-'
              : '-';
            const typeName = typeView?.nom || typeView?.name || '-';
            
            return (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Agent</Typography>
                  <Typography variant="body1">
                    {agentName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Type de matériel</Typography>
                  <Typography variant="body1">{typeName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date de besoin</Typography>
                  <Typography variant="body1">
                    {viewingBesoin.dateBesoin ? new Date(viewingBesoin.dateBesoin).toLocaleDateString('fr-FR') : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                  <Chip
                    label={viewingBesoin.statut || 'CRÉÉ'}
                    color={getStatutColor(viewingBesoin.statut)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Raison</Typography>
                  <Typography variant="body1">{viewingBesoin.raison || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Observation</Typography>
                  <Typography variant="body1">{viewingBesoin.observation || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date de création</Typography>
                  <Typography variant="body1">
                    {viewingBesoin.dateCreation ? new Date(viewingBesoin.dateCreation).toLocaleDateString('fr-FR') : '-'}
                  </Typography>
                </Grid>
                {viewingBesoin.validateur && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Validé par</Typography>
                    <Typography variant="body1">
                      {viewingBesoin.validateur.nom || ''} {viewingBesoin.validateur.username || ''}
                    </Typography>
                  </Grid>
                )}
                {viewingBesoin.viseur && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Visé par</Typography>
                    <Typography variant="body1">
                      {viewingBesoin.viseur.nom || ''} {viewingBesoin.viseur.username || ''}
                    </Typography>
                  </Grid>
                )}
                {viewingBesoin.decideur && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {viewingBesoin.statut === 'ACCEPTÉ' ? 'Accepté par' : 'Refusé par'}
                    </Typography>
                    <Typography variant="body1">
                      {viewingBesoin.decideur.nom || ''} {viewingBesoin.decideur.username || ''}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseViewDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BesoinsExprimes;
