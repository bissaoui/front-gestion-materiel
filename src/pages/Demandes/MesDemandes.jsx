import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  TablePagination,
  Tooltip,
  IconButton
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../utils/storage";
import { API_URL } from "../../api/auth";

const MesDemandes = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchAgent, setSearchAgent] = useState("");
  const [searchDateStart, setSearchDateStart] = useState("");
  const [searchDateEnd, setSearchDateEnd] = useState("");
  const [searchArticle, setSearchArticle] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const token = getToken();
  const navigate = useNavigate();

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
        setDemandes(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de récupérer les demandes.");
        setLoading(false);
      });
  }, [token, navigate]);

  if (!token) return null;

  // Filtrage des demandes avec l'intervalle de date
  const filteredDemandes = demandes.filter((demande) => {
    const matchesAgent = searchAgent
      ? demande.agentNom.toLowerCase().includes(searchAgent.toLowerCase())
      : true;
    const matchesArticle = searchArticle
      ? demande.lignes.some((ligne) =>
          ligne.designation.toLowerCase().includes(searchArticle.toLowerCase())
        )
      : true;
    const demandeDate = new Date(demande.date);
    const startDate = searchDateStart ? new Date(searchDateStart) : null;
    const endDate = searchDateEnd ? new Date(searchDateEnd) : null;
    const matchesDate =
      (startDate ? demandeDate >= startDate : true) &&
      (endDate ? demandeDate <= endDate : true);
    return matchesAgent && matchesDate && matchesArticle;
  });

  // Pagination logic (update to use page and rowsPerPage)
  const indexOfLastItem = (page + 1) * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredDemandes.slice(indexOfFirstItem, indexOfLastItem);
  const totalCount = filteredDemandes.length;

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
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper} x={{ borderRadius: 2, boxShadow: 1 }}>
            <Table >
              <TableHead sx={{ background: '#f4f6fa' }}>
                <TableRow>
                  <TableCell>
                    ID
                  </TableCell>
                  <TableCell >
                    Date
                  </TableCell>
                  <TableCell >
                    Agent
                  </TableCell>
                  <TableCell >
                    Direction
                  </TableCell>
                  <TableCell >
                    Statut
                  </TableCell>
                  <TableCell align="center" >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">Aucune demande trouvée.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((demande) => (
                    <TableRow key={demande.id} hover>
                      <TableCell>{demande.id}</TableCell>
                      <TableCell>{new Date(demande.date).toLocaleDateString()}</TableCell>
                      <TableCell>{demande.agentNom.toUpperCase()}</TableCell>
                      <TableCell>{demande.direction}</TableCell>
                      <TableCell>
                        {demande.validation ? (
                          <Typography color="success.main">Validée</Typography>
                        ) : (
                          <Typography color="error.main">Non validée</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Détails">
                          <IconButton color="primary" onClick={() => navigate(`/demande/details/${demande.id}`)}>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 20, 50, 100]}
              labelRowsPerPage="Lignes par page"
            />
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default MesDemandes;
