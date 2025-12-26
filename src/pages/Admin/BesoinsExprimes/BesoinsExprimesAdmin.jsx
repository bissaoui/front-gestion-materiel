import React, { useState, useEffect, useMemo } from 'react';
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
  IconButton,
  Tooltip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { API_URL } from '../../../api/auth';
import { getToken } from '../../../utils/storage';

const BesoinsExprimesAdmin = () => {
  const [besoins, setBesoins] = useState([]);
  const [filteredBesoins, setFilteredBesoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewingBesoin, setViewingBesoin] = useState(null);
  const [openRefuseDialog, setOpenRefuseDialog] = useState(false);
  const [refusingBesoin, setRefusingBesoin] = useState(null);
  const [motifRefus, setMotifRefus] = useState('');
  const [agents, setAgents] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [materiels, setMateriels] = useState([]);
  
  // États pour la popup d'affectation
  const [openAffectDialog, setOpenAffectDialog] = useState(false);
  const [acceptingBesoin, setAcceptingBesoin] = useState(null);
  const [selectedMarque, setSelectedMarque] = useState(null);
  const [selectedModele, setSelectedModele] = useState(null);
  const [selectedMateriel, setSelectedMateriel] = useState(null);
  const [materielsDisponibles, setMaterielsDisponibles] = useState([]);
  const [dateAffectation, setDateAffectation] = useState(new Date().toISOString().slice(0, 10));
  const [affectLoading, setAffectLoading] = useState(false);
  
  // Filtres
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtreAgent, setFiltreAgent] = useState(null);
  const [filtreType, setFiltreType] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Statistiques
  const stats = useMemo(() => {
    const total = besoins.length;
    const crees = besoins.filter(b => b.statut === 'CRÉÉ').length;
    const valides = besoins.filter(b => b.statut === 'VALIDATION').length;
    const vises = besoins.filter(b => b.statut === 'VISA').length;
    const acceptes = besoins.filter(b => b.statut === 'ACCEPTÉ').length;
    const refuses = besoins.filter(b => b.statut === 'REFUSÉ').length;
    
    return { total, crees, valides, vises, acceptes, refuses };
  }, [besoins]);

  useEffect(() => {
    fetchAgents();
    fetchTypes();
    fetchMarques();
    fetchModeles();
    fetchMateriels();
    fetchBesoins();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [besoins, filtreStatut, filtreAgent, filtreType, recherche, dateDebut, dateFin]);

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

  const fetchMarques = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/marques`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMarques(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des marques:', err);
    }
  };

  const fetchModeles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/modeles`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setModeles(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des modèles:', err);
    }
  };

  const fetchMateriels = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/materiels`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMateriels(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des matériels:', err);
    }
  };

  const fetchBesoins = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/besoins-exprimes`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        params: { page: 0, size: 1000 }
      });
      const besoinsData = response.data.content || response.data;
      const besoinsArray = Array.isArray(besoinsData) ? besoinsData : [];
      
      // Enrichir les besoins avec les données des agents et types
      const besoinsEnriched = besoinsArray.map(besoin => {
        if (besoin.agent && (!besoin.agent.nom && !besoin.agent.username) && besoin.agent.id) {
          const agentComplet = agents.find(a => a.id === besoin.agent.id);
          if (agentComplet) {
            besoin.agent = { ...besoin.agent, ...agentComplet };
          }
        }
        
        if (besoin.typeMateriel && !besoin.typeMateriel.nom && besoin.typeMateriel.id) {
          const typeComplet = types.find(t => t.id === besoin.typeMateriel.id);
          if (typeComplet) {
            besoin.typeMateriel = { ...besoin.typeMateriel, ...typeComplet };
          }
        }
        
        return besoin;
      });
      
      setBesoins(besoinsEnriched);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des besoins');
      setBesoins([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...besoins];

    // Filtre par statut
    if (filtreStatut) {
      filtered = filtered.filter(b => b.statut === filtreStatut);
    }

    // Filtre par agent
    if (filtreAgent) {
      filtered = filtered.filter(b => {
        const agentId = b.agent?.id || b.agentId;
        return Number(agentId) === Number(filtreAgent.id);
      });
    }

    // Filtre par type
    if (filtreType) {
      filtered = filtered.filter(b => {
        const typeId = b.typeMateriel?.id || b.typeMaterielId;
        return Number(typeId) === Number(filtreType.id);
      });
    }

    // Recherche textuelle (raison, observation)
    if (recherche) {
      const searchLower = recherche.toLowerCase();
      filtered = filtered.filter(b => 
        (b.raison && b.raison.toLowerCase().includes(searchLower)) ||
        (b.observation && b.observation.toLowerCase().includes(searchLower))
      );
    }

    // Filtre par date
    if (dateDebut) {
      filtered = filtered.filter(b => {
        if (!b.dateBesoin) return false;
        const dateBesoin = new Date(b.dateBesoin);
        const debut = new Date(dateDebut);
        return dateBesoin >= debut;
      });
    }

    if (dateFin) {
      filtered = filtered.filter(b => {
        if (!b.dateBesoin) return false;
        const dateBesoin = new Date(b.dateBesoin);
        const fin = new Date(dateFin);
        fin.setHours(23, 59, 59, 999);
        return dateBesoin <= fin;
      });
    }

    setFilteredBesoins(filtered);
    setPage(0); // Reset à la première page lors du filtrage
  };

  const handleViewBesoin = (besoin) => {
    setViewingBesoin(besoin);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingBesoin(null);
  };

  const handleAccept = (besoin) => {
    setAcceptingBesoin(besoin);
    setSelectedMarque(null);
    setSelectedModele(null);
    setSelectedMateriel(null);
    setMaterielsDisponibles([]);
    setDateAffectation(new Date().toISOString().slice(0, 10));
    setOpenAffectDialog(true);
  };

  const handleCloseAffectDialog = () => {
    setOpenAffectDialog(false);
    setAcceptingBesoin(null);
    setSelectedMarque(null);
    setSelectedModele(null);
    setSelectedMateriel(null);
    setMaterielsDisponibles([]);
  };

  // Filtrer les marques selon le type sélectionné
  const filteredMarques = useMemo(() => {
    if (!acceptingBesoin) return [];
    const typeId = acceptingBesoin.typeMateriel?.id || acceptingBesoin.typeMaterielId;
    if (!typeId) return [];
    
    // Récupérer les marques qui ont des matériels du type sélectionné
    const marqueIds = new Set(
      materiels
        .filter(m => m.typeMaterielId === Number(typeId))
        .map(m => m.marqueId)
    );
    return marques.filter(m => marqueIds.has(m.id));
  }, [acceptingBesoin, marques, materiels]);

  // Filtrer les modèles selon la marque et le type
  const filteredModeles = useMemo(() => {
    if (!selectedMarque || !acceptingBesoin) return [];
    const typeId = acceptingBesoin.typeMateriel?.id || acceptingBesoin.typeMaterielId;
    if (!typeId) return [];
    
    return modeles.filter(mo => 
      mo.marqueId === Number(selectedMarque.id) && 
      mo.typeMaterielId === Number(typeId)
    );
  }, [selectedMarque, acceptingBesoin, modeles]);

  // Filtrer les matériels disponibles selon le modèle
  useEffect(() => {
    if (selectedModele && acceptingBesoin) {
      const disponibles = materiels.filter(m => 
        m.modeleId === Number(selectedModele.id) && 
        !m.agentId // Seulement les matériels non affectés
      );
      setMaterielsDisponibles(disponibles);
      if (disponibles.length === 0) {
        setSelectedMateriel(null);
      }
    } else {
      setMaterielsDisponibles([]);
      setSelectedMateriel(null);
    }
  }, [selectedModele, materiels, acceptingBesoin]);

  // Réinitialiser modèle et matériel quand la marque change
  useEffect(() => {
    if (!selectedMarque) {
      setSelectedModele(null);
      setSelectedMateriel(null);
    }
  }, [selectedMarque]);

  // Réinitialiser matériel quand le modèle change
  useEffect(() => {
    if (!selectedModele) {
      setSelectedMateriel(null);
    }
  }, [selectedModele]);

  const handleAffectAndAccept = async () => {
    if (!acceptingBesoin || !selectedMateriel) {
      setError('Veuillez sélectionner un matériel');
      return;
    }

    setAffectLoading(true);
    setError('');
    setSuccess('');

    try {
      const agentId = acceptingBesoin.agent?.id || acceptingBesoin.agentId;
      
      // 1. Affecter le matériel
      await axios.put(
        `${API_URL}/api/materiels/${selectedMateriel.id}/affecter/${agentId}`,
        { dateAffectation: `${dateAffectation}T00:00:00` },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      // 2. Accepter le besoin
      await axios.put(
        `${API_URL}/api/besoins-exprimes/${acceptingBesoin.id}/accepter`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setSuccess('Matériel affecté et besoin accepté avec succès');
      handleCloseAffectDialog();
      await fetchBesoins();
      await fetchMateriels(); // Rafraîchir la liste des matériels
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'affectation/acceptation';
      setError(`Erreur: ${errorMessage}`);
    } finally {
      setAffectLoading(false);
    }
  };

  const handleRefuse = (besoin) => {
    setRefusingBesoin(besoin);
    setMotifRefus('');
    setOpenRefuseDialog(true);
  };

  const handleConfirmRefuse = async () => {
    if (!refusingBesoin) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.put(`${API_URL}/api/besoins-exprimes/${refusingBesoin.id}/refuser`, 
        { motif: motifRefus },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSuccess('Besoin refusé avec succès');
      setOpenRefuseDialog(false);
      setRefusingBesoin(null);
      setMotifRefus('');
      await fetchBesoins();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du refus';
      setError(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFiltreStatut('');
    setFiltreAgent(null);
    setFiltreType(null);
    setRecherche('');
    setDateDebut('');
    setDateFin('');
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

  // Pagination
  const paginatedBesoins = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredBesoins.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredBesoins, page, rowsPerPage]);

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#1B4C43' }}>
          Gestion des Besoins Exprimés
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => {
            // TODO: Implémenter l'export
            alert('Fonctionnalité d\'export à implémenter');
          }}
        >
          Exporter
        </Button>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Total</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Créés</Typography>
              <Typography variant="h4">{stats.crees}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Validés</Typography>
              <Typography variant="h4">{stats.valides}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Visés</Typography>
              <Typography variant="h4">{stats.vises}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Acceptés</Typography>
              <Typography variant="h4" color="success.main">{stats.acceptes}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Refusés</Typography>
              <Typography variant="h4" color="error.main">{stats.refuses}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filtres</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button size="small" onClick={handleResetFilters}>
              Réinitialiser
            </Button>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filtreStatut}
                  label="Statut"
                  onChange={(e) => setFiltreStatut(e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="CRÉÉ">Créé</MenuItem>
                  <MenuItem value="VALIDATION">Validation</MenuItem>
                  <MenuItem value="VISA">Visa</MenuItem>
                  <MenuItem value="ACCEPTÉ">Accepté</MenuItem>
                  <MenuItem value="REFUSÉ">Refusé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                options={agents}
                getOptionLabel={(option) => `${option.nom || ''} ${option.username || ''}`.trim()}
                value={filtreAgent}
                onChange={(e, newValue) => setFiltreAgent(newValue)}
                size="small"
                renderInput={(params) => (
                  <TextField {...params} label="Agent" />
                )}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                options={types}
                getOptionLabel={(option) => option.nom || ''}
                value={filtreType}
                onChange={(e, newValue) => setFiltreType(newValue)}
                size="small"
                renderInput={(params) => (
                  <TextField {...params} label="Type de matériel" />
                )}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Recherche"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Raison, observation..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Date début"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Date fin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
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
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ background: '#f4f6fa' }}>
                    <TableRow>
                      <TableCell>ID</TableCell>
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
                    {paginatedBesoins.map((besoin) => {
                      let agent = null;
                      if (besoin.agent) {
                        agent = agents.find(a => a.id === besoin.agent.id) || besoin.agent;
                      } else if (besoin.agentId) {
                        agent = agents.find(a => a.id === besoin.agentId);
                      }
                      
                      let typeMateriel = null;
                      if (besoin.typeMateriel) {
                        typeMateriel = types.find(t => t.id === besoin.typeMateriel.id) || besoin.typeMateriel;
                      } else if (besoin.typeMaterielId) {
                        typeMateriel = types.find(t => t.id === besoin.typeMaterielId);
                      }
                      
                      const agentName = agent 
                        ? `${agent.nom || agent.name || ''} ${agent.username || ''}`.trim() || agent.username || agent.nom || agent.name || '-'
                        : '-';
                      const typeName = typeMateriel?.nom || typeMateriel?.name || '-';
                      
                      return (
                        <TableRow key={besoin.id} hover>
                          <TableCell>{besoin.id}</TableCell>
                          <TableCell>{agentName}</TableCell>
                          <TableCell>{typeName}</TableCell>
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
                            {besoin.statut === 'VISA' && (
                              <>
                                <Tooltip title="Accepter">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleAccept(besoin)}
                                    disabled={loading}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Refuser">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRefuse(besoin)}
                                    disabled={loading}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredBesoins.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Lignes par page:"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour voir les détails */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Détails du besoin #{viewingBesoin?.id}</Typography>
        </DialogTitle>
        <DialogContent>
          {viewingBesoin && (() => {
            let agentView = null;
            if (viewingBesoin.agent) {
              agentView = agents.find(a => a.id === viewingBesoin.agent.id) || viewingBesoin.agent;
            } else if (viewingBesoin.agentId) {
              agentView = agents.find(a => a.id === viewingBesoin.agentId);
            }
            
            let typeView = null;
            if (viewingBesoin.typeMateriel) {
              typeView = types.find(t => t.id === viewingBesoin.typeMateriel.id) || viewingBesoin.typeMateriel;
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
                    <Typography variant="body1">{agentName}</Typography>
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

      {/* Dialog pour refuser */}
      <Dialog
        open={openRefuseDialog}
        onClose={() => {
          setOpenRefuseDialog(false);
          setRefusingBesoin(null);
          setMotifRefus('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Refuser le besoin</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Motif du refus"
            value={motifRefus}
            onChange={(e) => setMotifRefus(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Veuillez indiquer le motif du refus..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setOpenRefuseDialog(false);
              setRefusingBesoin(null);
              setMotifRefus('');
            }}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmRefuse}
            disabled={loading || !motifRefus.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirmer le refus'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour affecter et accepter */}
      <Dialog
        open={openAffectDialog}
        onClose={handleCloseAffectDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            minWidth: '550px',
            maxWidth: '650px'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Affecter le matériel et accepter le besoin
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ minWidth: '500px' }}>
          {acceptingBesoin && (() => {
            let agentBesoin = null;
            if (acceptingBesoin.agent) {
              agentBesoin = agents.find(a => a.id === acceptingBesoin.agent.id) || acceptingBesoin.agent;
            } else if (acceptingBesoin.agentId) {
              agentBesoin = agents.find(a => a.id === acceptingBesoin.agentId);
            }
            
            let typeBesoin = null;
            if (acceptingBesoin.typeMateriel) {
              typeBesoin = types.find(t => t.id === acceptingBesoin.typeMateriel.id) || acceptingBesoin.typeMateriel;
            } else if (acceptingBesoin.typeMaterielId) {
              typeBesoin = types.find(t => t.id === acceptingBesoin.typeMaterielId);
            }
            
            const agentName = agentBesoin 
              ? `${agentBesoin.nom || agentBesoin.name || ''} ${agentBesoin.username || ''}`.trim() || agentBesoin.username || agentBesoin.nom || agentBesoin.name || '-'
              : '-';
            const typeName = typeBesoin?.nom || typeBesoin?.name || '-';
            
            return (
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}
                
                {/* Agent (lecture seule) */}
                <TextField
                  label="Agent"
                  value={agentName}
                  fullWidth
                  disabled
                  InputLabelProps={{ shrink: true }}
                />
                
                {/* Type de matériel (lecture seule) */}
                <TextField
                  label="Type de matériel"
                  value={typeName}
                  fullWidth
                  disabled
                  InputLabelProps={{ shrink: true }}
                />
                
                {/* Marque */}
                <Autocomplete
                  options={filteredMarques}
                  getOptionLabel={(option) => option.nom || ''}
                  value={selectedMarque}
                  onChange={(e, newValue) => setSelectedMarque(newValue)}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Marque *"
                      placeholder="Sélectionner une marque..."
                      required
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        shrink: true,
                        sx: { 
                          whiteSpace: 'nowrap',
                          overflow: 'visible',
                          textOverflow: 'clip'
                        }
                      }}
                    />
                  )}
                  noOptionsText="Aucune marque trouvée"
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                />
                
                {/* Modèle */}
                <Autocomplete
                  options={filteredModeles}
                  getOptionLabel={(option) => option.nom || ''}
                  value={selectedModele}
                  onChange={(e, newValue) => setSelectedModele(newValue)}
                  fullWidth
                  disabled={!selectedMarque}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Modèle *"
                      placeholder={selectedMarque ? "Sélectionner un modèle..." : "Sélectionnez d'abord une marque"}
                      required
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        shrink: true,
                        sx: { 
                          whiteSpace: 'nowrap',
                          overflow: 'visible',
                          textOverflow: 'clip'
                        }
                      }}
                    />
                  )}
                  noOptionsText="Aucun modèle trouvé"
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                />
                
                {/* Matériel */}
                <Autocomplete
                  options={materielsDisponibles}
                  getOptionLabel={(option) => option.numeroSerie || ''}
                  value={selectedMateriel}
                  onChange={(e, newValue) => setSelectedMateriel(newValue)}
                  fullWidth
                  disabled={!selectedModele || materielsDisponibles.length === 0}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Matériel (Numéro de série) *"
                      placeholder={selectedModele ? (materielsDisponibles.length === 0 ? "Aucun matériel disponible" : "Sélectionner un matériel...") : "Sélectionnez d'abord un modèle"}
                      required
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        shrink: true,
                        sx: { 
                          whiteSpace: 'nowrap',
                          overflow: 'visible',
                          textOverflow: 'clip'
                        }
                      }}
                    />
                  )}
                  noOptionsText={selectedModele && materielsDisponibles.length === 0 ? "Aucun matériel disponible pour ce modèle" : "Aucun matériel trouvé"}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                />
                
                {/* Date d'affectation */}
                <TextField
                  label="Date d'affectation *"
                  type="date"
                  value={dateAffectation}
                  onChange={(e) => setDateAffectation(e.target.value)}
                  fullWidth
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { 
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip'
                    }
                  }}
                  required
                />
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseAffectDialog} disabled={affectLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleAffectAndAccept}
            variant="contained"
            color="primary"
            disabled={affectLoading || !selectedMateriel}
            sx={{
              bgcolor: '#A97B2A',
              '&:hover': { bgcolor: '#8B6A1F' }
            }}
          >
            {affectLoading ? <CircularProgress size={24} /> : 'Affecter et Accepter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BesoinsExprimesAdmin;

