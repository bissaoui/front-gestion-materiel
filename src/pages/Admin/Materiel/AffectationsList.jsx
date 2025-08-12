import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../../api/auth';
import { getToken } from '../../../utils/storage';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button as MuiButton,
  CircularProgress,
  Alert,
  Box,
  TablePagination,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import PaginationControl from '../../../components/PaginationControl';
import { Link } from 'react-router-dom';
import CardLayout from '../../../components/CardLayout';
import navTabs from "../../../components/adminNavTabs";


const AffectationsList = () => {
  const [materiels, setMateriels] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMarque, setSelectedMarque] = useState('');
  const [selectedModele, setSelectedModele] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${API_URL}/api/materiels`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      axios.get(`${API_URL}/api/types`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      axios.get(`${API_URL}/api/marques`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      axios.get(`${API_URL}/api/modeles`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      axios.get(`${API_URL}/api/agents`, { headers: { Authorization: `Bearer ${getToken()}` } })
    ]).then(([matRes, typeRes, marqueRes, modeleRes, agentRes]) => {
      setMateriels(Array.isArray(matRes.data) ? matRes.data : []);
      setTypes(Array.isArray(typeRes.data) ? typeRes.data : []);
      setMarques(Array.isArray(marqueRes.data) ? marqueRes.data : []);
      setModeles(Array.isArray(modeleRes.data) ? modeleRes.data : []);
      setAgents(Array.isArray(agentRes.data) ? agentRes.data : []);
    }).catch(() => setError("Erreur lors du chargement des données"))
      .finally(() => setLoading(false));
  }, []);

  const handleDesaffecter = async (id) => {
    if (!window.confirm('Désaffecter ce matériel ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/api/materiels/${id}/desaffecter`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSuccess('Matériel désaffecté avec succès');
      // Refresh
      const res = await axios.get(`${API_URL}/api/materiels`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setMateriels(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de la désaffectation");
    }
    setLoading(false);
  };

  // Filtrage
  const filteredMateriels = materiels.filter(m => {
    const matchNumSerie = m.numeroSerie?.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType ? m.typeMaterielId === Number(selectedType) : true;
    const matchMarque = selectedMarque ? m.marqueId === Number(selectedMarque) : true;
    const matchModele = selectedModele ? m.modeleId === Number(selectedModele) : true;
    const matchAgent = selectedAgent ? m.agentId === Number(selectedAgent) : true;
    return matchNumSerie && matchType && matchMarque && matchModele && matchAgent;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMateriels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMateriels.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // reset page when itemsPerPage changes
  }, [itemsPerPage]);

  // Calcul des marques filtrées dynamiquement selon le type sélectionné
  const filteredMarques = React.useMemo(() => {
    if (!selectedType) return marques;
    // Trouver les marques qui ont au moins un matériel du type sélectionné
    const marqueIds = new Set(
      materiels.filter(m => m.typeMaterielId === Number(selectedType)).map(m => m.marqueId)
    );
    return marques.filter(ma => marqueIds.has(ma.id));
  }, [marques, materiels, selectedType]);

  // Calcul des modèles filtrés dynamiquement selon le type et la marque sélectionnés
  const filteredModeles = React.useMemo(() => {
    return modeles.filter(mo => {
      const matchType = selectedType ? mo.typeMaterielId === Number(selectedType) : true;
      const matchMarque = selectedMarque ? mo.marqueId === Number(selectedMarque) : true;
      return matchType && matchMarque;
    });
  }, [modeles, selectedType, selectedMarque]);

  // Ajout d'une constante pour le menu déroulant large
  const selectMenuProps = {
    PaperProps: {
      style: {
        maxHeight: 300,
        minWidth: 220,
      },
    },
  };

  return (
    <CardLayout
      title="Affectations des Matériels"
      navTabs={navTabs}
      currentPath={window.location.pathname}
    >
      <Box mb={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={2}>
            <TextField
              label="Recherche"
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small" sx={{ minWidth: 180, maxWidth: 260 }}>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                value={selectedType}
                label="Type"
                onChange={e => setSelectedType(e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="">Tous les types</MenuItem>
                {types.map(type => (
                  <MenuItem key={type.id} value={type.id} sx={{ whiteSpace: 'normal' }}>{type.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small" sx={{ minWidth: 180, maxWidth: 260 }}>
              <InputLabel id="marque-label">Marque</InputLabel>
              <Select
                labelId="marque-label"
                value={selectedMarque}
                label="Marque"
                onChange={e => setSelectedMarque(e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="">Toutes les marques</MenuItem>
                {filteredMarques.map(marque => (
                  <MenuItem key={marque.id} value={marque.id} sx={{ whiteSpace: 'normal' }}>{marque.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small" sx={{ minWidth: 180, maxWidth: 260 }}>
              <InputLabel id="modele-label">Modèle</InputLabel>
              <Select
                labelId="modele-label"
                value={selectedModele}
                label="Modèle"
                onChange={e => setSelectedModele(e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="">Tous les modèles</MenuItem>
                {filteredModeles.map(modele => (
                  <MenuItem key={modele.id} value={modele.id} sx={{ whiteSpace: 'normal' }}>{modele.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small" sx={{ minWidth: 180, maxWidth: 260 }}>
              <InputLabel id="agent-label">Agent</InputLabel>
              <Select
                labelId="agent-label"
                value={selectedAgent}
                label="Agent"
                onChange={e => setSelectedAgent(e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="">Tous les agents</MenuItem>
                {agents.map(agent => (
                  <MenuItem key={agent.id} value={agent.id} sx={{ whiteSpace: 'normal' }}>{agent.nom} {agent.username}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <MuiTable sx={{ minWidth: 900 }}>
            <TableHead  sx={{ background: '#f4f6fa' }}>
              <TableRow >
                <TableCell>Numéro de série</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Marque</TableCell>
                <TableCell>Modèle</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Date d'affectation</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary' }}>
                    Aucun matériel trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map(m => {
                  const type = types.find(t => t.id === m.typeMaterielId)?.nom || '-';
                  const marque = marques.find(ma => ma.id === m.marqueId)?.nom || '-';
                  const modele = modeles.find(mo => mo.id === m.modeleId)?.nom || '-';
                  const agent = agents.find(a => a.id === m.agentId);
                  const statut = m.agentId ? 'Affecté' : 'Disponible';
                  return (
                    <TableRow key={m.id} hover>
                      <TableCell>{m.numeroSerie}</TableCell>
                      <TableCell>{type}</TableCell>
                      <TableCell>{marque}</TableCell>
                      <TableCell>{modele}</TableCell>
                      <TableCell>{agent ? `${agent.nom} ${agent.username}` : <Chip label="-" size="small" color="default" />}</TableCell>
                      <TableCell>{m.dateAffectation ? new Date(m.dateAffectation).toLocaleDateString() : <Chip label="-" size="small" color="default" />}</TableCell>
                      <TableCell>
                        {m.agentId ? (
                          <Chip label="Affecté" size="small" sx={{ backgroundColor: '#388e3c', color: 'white' }} />
                        ) : (
                          <Chip label="Disponible" size="small" sx={{ backgroundColor: '#fbc02d', color: 'black' }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {m.agentId && (
                          <MuiButton variant="outlined" color="error" size="small" onClick={() => handleDesaffecter(m.id)}>
                            Désaffecter
                          </MuiButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </MuiTable>
          <TablePagination
            component="div"
            count={materiels.length}
            page={currentPage - 1}
            onPageChange={(e, newPage) => setCurrentPage(newPage + 1)}
            rowsPerPage={itemsPerPage}
            onRowsPerPageChange={e => { setItemsPerPage(parseInt(e.target.value, 10)); setCurrentPage(1); }}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            labelRowsPerPage="Lignes par page"
          />
        </TableContainer>
      )}
    </CardLayout>
  );
};

export default AffectationsList; 