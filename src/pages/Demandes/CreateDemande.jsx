import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Autocomplete,
  Tooltip
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../utils/storage";
import { API_URL } from "../../api/auth";

const CreateDemande = () => {
  const [date, setDate] = useState("");
  const [agentId, setAgentId] = useState("");
  const [agents, setAgents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [lignes, setLignes] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [ruptureArticle, setRuptureArticle] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    axios
      .get(`${API_URL}/api/agents`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((response) => setAgents(response.data))
      .catch(() => {});
    axios
      .get(`${API_URL}/api/articles`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((response) => setArticles(response.data))
      .catch(() => {});
  }, []);

  const addLigne = () => {
    setLignes([...lignes, { articleId: "", quantite: 1, observation: "" }]);
  };

  const updateLigne = (index, field, value) => {
    const updatedLignes = [...lignes];
    updatedLignes[index][field] = value;
    setLignes(updatedLignes);
    setErrors({ ...errors, [index]: "" });
  };

  const removeLigne = (index) => {
    setLignes(lignes.filter((_, i) => i !== index));
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[index];
      return updatedErrors;
    });
  };

  const handleArticleChange = (index, value) => {
    const article = articles.find(a => a.id === value);
    if (article && article.qte === 0) {
      setRuptureArticle(article);
      setOpenStockDialog(true);
      return;
    }
    updateLigne(index, "articleId", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let lignesToSend = [];
    let hasError = false;
    let newErrors = {};
    for (const [index, ligne] of lignes.entries()) {
      try {
        const articleResponse = await axios.get(
          `${API_URL}/api/articles/${ligne.articleId}`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        const article = articleResponse.data;
        if (article.qte < ligne.quantite) {
          newErrors[index] = `Stock insuffisant (${article.qte} restant)`;
          hasError = true;
        } else {
          lignesToSend.push({
            quantite: ligne.quantite,
            observation: ligne.observation,
            article: { id: ligne.articleId },
            nouvelleQuantite: article.qte - ligne.quantite,
          });
        }
      } catch (error) {
        newErrors[index] = "Erreur de vérification du stock.";
        hasError = true;
      }
    }
    setErrors(newErrors);
    if (hasError) { setSubmitting(false); return; }
    try {
      const demandeResponse = await axios.post(
        `${API_URL}/api/demandes`,
        { date, agent: { id: agentId } },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const demandeId = demandeResponse.data.id;
      for (const ligne of lignesToSend) {
        await axios.put(
          `${API_URL}/api/articles/qte/${ligne.article.id}`,
          { quantite: ligne.nouvelleQuantite },
          { headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" } }
        );
        ligne.demande = { id: demandeId };
        delete ligne.nouvelleQuantite;
      }
      await axios.post(
        `${API_URL}/api/ligne-demandes/bulk`,
        lignesToSend,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSuccessMessage("✅ Demande créée avec succès ! Redirection dans...");
      let counter = 4;
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
        counter--;
        if (counter === 0) {
          clearInterval(interval);
          navigate("/demandes");
        }
      }, 1000);
    } catch (error) {
      // Optionally show error
    }
    setSubmitting(false);
  };

  // Calculer le nombre d'articles disponibles (stock > 0)
  const totalAvailableArticles = articles.filter(article => article.qte > 0).length;

  return (
    <Container maxWidth="md" sx={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', borderRadius: 3, boxShadow: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Créer une nouvelle demande
          </Typography>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage} <strong>{countdown}</strong>...
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                size="small"
                sx={{ flex: 1, minWidth: 160, mb: 0.5 }}
              />
              <FormControl required sx={{ flex: 1, minWidth: 160, mb: 0.5 }} size="small">
                <InputLabel id="agent-label">Agent</InputLabel>
                <Select
                  labelId="agent-label"
                  value={agentId}
                  label="Agent"
                  onChange={e => setAgentId(e.target.value)}
                  size="small"
                >
                  <MenuItem value="">Sélectionner un agent</MenuItem>
                  {agents.map(agent => (
                    <MenuItem key={agent.id} value={agent.id}>{agent.nom}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              Lignes de demande
            </Typography>
            <TableContainer component={Card} sx={{ mb: 2, borderRadius: 2 }}>
              <Table size="small" sx={{ '& td, & th': { py: 0.5, px: 1 } }}>
                <TableHead  sx={{ background: '#f4f6fa' }}>
                  <TableRow >
                    <TableCell>Article</TableCell>
                    <TableCell>Quantité</TableCell>
                    <TableCell>Observation</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lignes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                        Aucune ligne ajoutée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lignes.map((ligne, index) => {
                      // Liste des articles déjà sélectionnés dans d'autres lignes
                      const selectedArticleIds = lignes
                        .filter((_, i) => i !== index)
                        .map(l => l.articleId)
                        .filter(Boolean);
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <FormControl fullWidth required size="small">
                              <Autocomplete
                                options={articles.filter(article => !selectedArticleIds.includes(article.id) && article.qte > 0)}
                                getOptionLabel={option => option.designation || ''}
                                value={articles.find(a => a.id === ligne.articleId) || null}
                                onChange={(_, newValue) => {
                                  if (newValue && newValue.qte === 0) {
                                    setRuptureArticle(newValue);
                                    setOpenStockDialog(true);
                                    return;
                                  }
                                  updateLigne(index, "articleId", newValue ? newValue.id : "");
                                }}
                                renderOption={(props, option) => (
                                  <li {...props} key={option.id}>
                                    <Tooltip title={option.designation} placement="right">
                                      <span style={{ whiteSpace: 'normal', maxWidth: 350, display: 'inline-block', overflowWrap: 'break-word' }}>{option.designation}</span>
                                    </Tooltip>
                                  </li>
                                )}
                                renderInput={params => (
                                  <Tooltip title={articles.find(a => a.id === ligne.articleId)?.designation || ''} placement="top">
                                    <TextField {...params} label="Article" required size="small" sx={{ minWidth: 180, whiteSpace: 'normal', mb: 0.5 }} />
                                  </Tooltip>
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                size="small"
                              />
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={ligne.quantite}
                              onChange={e => updateLigne(index, "quantite", e.target.value)}
                              inputProps={{ min: 1 }}
                              required
                              fullWidth
                              error={!!errors[index]}
                              helperText={errors[index]}
                              size="small"
                              sx={{ mb: 0.5 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="text"
                              value={ligne.observation}
                              onChange={e => updateLigne(index, "observation", e.target.value)}
                              fullWidth
                              size="small"
                              sx={{ mb: 0.5 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton color="error" onClick={() => removeLigne(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addLigne}
                sx={{ minWidth: 180 }}
                disabled={lignes.length >= totalAvailableArticles}
              >
                Ajouter une ligne
              </Button>
            </Box>
            <Button
              variant="contained"
              color="success"
              type="submit"
              fullWidth
              disabled={submitting}
              sx={{ py: 1.2, fontWeight: 600 }}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {submitting ? "Création en cours..." : "Créer la demande"}
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Dialog open={openStockDialog} onClose={() => setOpenStockDialog(false)}>
        <DialogTitle>Rupture de stock</DialogTitle>
        <DialogContent>
          <DialogContentText>
            L'article {ruptureArticle?.designation || ''} est en rupture de stock et ne peut pas être ajouté à la demande.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStockDialog(false)} autoFocus>OK</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateDemande;
