import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Skeleton,
  Alert,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Devices,
  Assignment,
  People,
  Store,
  Warning,
  CheckCircle,
  Schedule,
  Refresh,
  FilterList,
  Download,
  Share,
  Notifications,
  Business,
  Inventory,
  Assessment,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  DonutLarge,
  Timeline as TimelineIcon,
  Speed,
  Memory,
  Storage,
  NetworkCheck,
} from "@mui/icons-material";
import { getMateriels, getTypes, getMarques } from "../../../api/materiel";
import { getMarches } from "../../../api/marche";
import { getPrestataires } from "../../../api/prestataire";
import axios from "axios";
import { API_URL } from "../../../api/auth";
import { getToken } from "../../../utils/storage";
import "../../../components/Dashboard/dashboard.css";

const ModernDashboard = () => {
  const theme = useTheme();
  const [data, setData] = useState({
    materiels: [],
    types: [],
    marques: [],
    marches: [],
    prestataires: [],
    articles: [],
    demandes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Fetch data
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [materielsRes, typesRes, marquesRes, marchesRes, prestatairesRes, articlesRes, demandesRes] = await Promise.all([
        getMateriels(),
        getTypes(),
        getMarques(),
        getMarches(),
        getPrestataires(),
        axios.get(`${API_URL}/api/articles`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get(`${API_URL}/api/demandes`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);

      const newData = {
        materiels: Array.isArray(materielsRes.data) ? materielsRes.data : [],
        types: Array.isArray(typesRes.data) ? typesRes.data : [],
        marques: Array.isArray(marquesRes.data) ? marquesRes.data : [],
        marches: Array.isArray(marchesRes.data) ? marchesRes.data : [],
        prestataires: Array.isArray(prestatairesRes.data) ? prestatairesRes.data : [],
        articles: Array.isArray(articlesRes.data) ? articlesRes.data : [],
        demandes: Array.isArray(demandesRes.data) ? demandesRes.data : [],
      };

      setData(newData);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Real-time updates
  useEffect(() => {
    if (realTimeMode) {
      const interval = setInterval(() => {
        fetchData(true);
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [realTimeMode]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => fetchData()}>
            Réessayer
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <Box>
        {/* Header */}
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Dashboard Moderne
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Vue d'ensemble des métriques et performances
                </Typography>
              </Box>
              <Box display="flex" gap={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={realTimeMode}
                      onChange={(e) => setRealTimeMode(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Mode Temps Réel"
                  sx={{ color: 'white' }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => fetchData(true)}
                  disabled={refreshing}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  {refreshing ? 'Actualisation...' : 'Actualiser'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Key Metrics - Simplified Cards */}
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {data.materiels.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Matériels Totaux
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <Devices sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                  <Box mt={2}>
                    <LinearProgress
                      variant="determinate"
                      value={75}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': { bgcolor: 'white' },
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'right', opacity: 0.9 }}>
                      75% de capacité
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {data.marches.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Marchés Actifs
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <Store sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                  <Box mt={2}>
                    <LinearProgress
                      variant="determinate"
                      value={60}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': { bgcolor: 'white' },
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'right', opacity: 0.9 }}>
                      60% de progression
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #ed6c02 0%, #e65100 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {data.demandes.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Demandes
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <Assignment sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                  <Box mt={2}>
                    <LinearProgress
                      variant="determinate"
                      value={40}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': { bgcolor: 'white' },
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'right', opacity: 0.9 }}>
                      40% traitées
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {data.materiels.filter(m => m.quantite < 5).length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Stock Faible
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <Warning sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                  <Box mt={2}>
                    <LinearProgress
                      variant="determinate"
                      value={85}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': { bgcolor: 'white' },
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'right', opacity: 0.9 }}>
                      Attention requise
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Simple Statistics */}
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Répartition par Type
                  </Typography>
                  <Box mt={2}>
                    {data.types.map((type, index) => {
                      const count = data.materiels.filter(m => m.typeId === type.id).length;
                      const percentage = data.materiels.length > 0 ? (count / data.materiels.length) * 100 : 0;
                      return (
                        <Box key={type.id || index} mb={2}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2">{type.nom}</Typography>
                            <Typography variant="body2" fontWeight="bold">{count}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Répartition par Marque
                  </Typography>
                  <Box mt={2}>
                    {data.marques.map((marque, index) => {
                      const count = data.materiels.filter(m => m.marqueId === marque.id).length;
                      const percentage = data.materiels.length > 0 ? (count / data.materiels.length) * 100 : 0;
                      return (
                        <Box key={marque.id || index} mb={2}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2">{marque.nom}</Typography>
                            <Typography variant="body2" fontWeight="bold">{count}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Alerts and Recent Activity */}
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Alertes Récentes
                  </Typography>
                  <List>
                    {data.materiels.filter(m => m.quantite < 5).slice(0, 5).map((materiel, index) => (
                      <ListItem key={materiel.id || index} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.main' }}>
                            <Warning />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Stock faible: ${materiel.nom}`}
                          secondary={`Quantité: ${materiel.quantite} unités`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Activité Récente
                  </Typography>
                  <List>
                    {data.demandes.slice(0, 5).map((demande, index) => (
                      <ListItem key={demande.id || index} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Assignment />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Demande: ${demande.titre || 'Sans titre'}`}
                          secondary={`Statut: ${demande.statut || 'Non défini'}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default ModernDashboard;