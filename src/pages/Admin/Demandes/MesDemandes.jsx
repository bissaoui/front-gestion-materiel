import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  TextField
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../../utils/storage";
import { API_URL } from "../../../api/auth";

const MesDemandes = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchAgent, setSearchAgent] = useState("");
  const [searchDateStart, setSearchDateStart] = useState("");
  const [searchDateEnd, setSearchDateEnd] = useState("");
  const [searchArticle, setSearchArticle] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const token = getToken();
  const navigate = useNavigate();

  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      flex: 0.5,
      filterable: true,
      sortable: true
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      flex: 1,
      filterable: true,
      sortable: true,
      renderCell: (params) => {
        if (!params || !params.value) return 'Date non définie';
        try {
          return new Date(params.value).toLocaleDateString();
        } catch (error) {
          return 'Date invalide';
        }
      }
    },
    { 
      field: 'agentNom', 
      headerName: 'Agent', 
      flex: 1.2,
      filterable: true,
      sortable: true,
      renderCell: (params) => {
        if (!params || !params.value) return 'Agent non défini';
        const nom = params.value.toUpperCase();
        const prenom = params.row && params.row.agentPrenom ? params.row.agentPrenom.toUpperCase() : '';
        return prenom ? `${prenom} ${nom}` : nom;
      }
    },
    { 
      field: 'direction', 
      headerName: 'Direction', 
      flex: 1,
      filterable: true,
      sortable: true,
      renderCell: (params) => (params && params.value) || 'Direction non définie'
    },
    { 
      field: 'validation', 
      headerName: 'Statut', 
      flex: 0.8,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ 
          color: (params && params.value) ? 'success.main' : 'error.main',
          fontWeight: 'medium'
        }}>
          {(params && params.value) ? 'Validée' : 'Non validée'}
        </Box>
      ),
      valueFormatter: (params) => (params && params.value) ? 'Validée' : 'Non validée'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => navigate(`/demande/details/${params.row.id}`)}
          sx={{ 
            minWidth: 'auto', 
            px: 1.5, 
            py: 0.5,
            fontSize: '0.75rem',
            textTransform: 'none',
            height: 28,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <InfoIcon sx={{ fontSize: 16, mr: 0.5 }} />
          Détails
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    axios
      .get(`${API_URL}/api/demandes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log('📊 Données reçues de l\'API:', response.data);
        setDemandes(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de récupérer les demandes.");
        setLoading(false);
      });
  }, [token, navigate]);

  if (!token) return null;

  // Filtrage des demandes avec l'intervalle de date et recherche
  const filteredDemandes = demandes.filter((demande) => {
    const matchesAgent = searchAgent
      ? demande.agentNom && demande.agentNom.toLowerCase().includes(searchAgent.toLowerCase())
      : true;
    const matchesArticle = searchArticle
      ? demande.lignes && demande.lignes.some((ligne) =>
          ligne.designation && ligne.designation.toLowerCase().includes(searchArticle.toLowerCase())
        )
      : true;
    const demandeDate = demande.date ? new Date(demande.date) : null;
    const startDate = searchDateStart ? new Date(searchDateStart) : null;
    const endDate = searchDateEnd ? new Date(searchDateEnd) : null;
    const matchesDate =
      (startDate && demandeDate ? demandeDate >= startDate : true) &&
      (endDate && demandeDate ? demandeDate <= endDate : true);
    return matchesAgent && matchesDate && matchesArticle;
  });

  const rows = filteredDemandes.map(demande => ({
    ...demande,
    id: demande.id
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          📋 Demandes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/demandes/create')}
          sx={{ minWidth: 200 }}
        >
          Ajouter une Demande
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }} elevation={3}>
        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
          <TextField
            label="Rechercher par agent"
            variant="outlined"
            value={searchAgent}
            onChange={(e) => setSearchAgent(e.target.value)}
            size="small"
            sx={{ minWidth: 220 }}
          />
          <TextField
            label="Date de début"
            type="date"
            value={searchDateStart}
            onChange={(e) => setSearchDateStart(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Date de fin"
            type="date"
            value={searchDateEnd}
            onChange={(e) => setSearchDateEnd(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Rechercher par article"
            variant="outlined"
            value={searchArticle}
            onChange={(e) => setSearchArticle(e.target.value)}
            size="small"
            sx={{ minWidth: 220 }}
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1 }}>
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              rowsPerPageOptions={[5, 10, 20, 50, 100]}
              disableSelectionOnClick
              sx={{ border: 0 }}
              filterMode="client"
              initialState={{
                filter: {
                  filterModel: {
                    items: [],
                  },
                },
              }}
            />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MesDemandes;
