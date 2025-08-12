import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Dialog, DialogTitle, DialogContent, Typography,
  Alert, CircularProgress, Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import AgentForm from './AgentForm';
import { getAgents, deleteAgent, getDirections, getDepartements, getServices } from '../../../api/agents';

const AgentsList = () => {
  const [agents, setAgents] = useState([]);
  const [directions, setDirections] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [services, setServices] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReferenceData = async () => {
    try {
      // Charger les données de référence
      const [dirRes, deptRes, servRes] = await Promise.all([
        getDirections(),
        getDepartements(),
        getServices()
      ]);

      // Parser les données si nécessaire
      let dirData = dirRes.data;
      let deptData = deptRes.data;
      let servData = servRes.data;

      if (typeof dirData === 'string') {
        try { dirData = JSON.parse(dirData); } catch (e) { dirData = []; }
      }
      if (typeof deptData === 'string') {
        try { deptData = JSON.parse(deptData); } catch (e) { deptData = []; }
      }
      if (typeof servData === 'string') {
        try { servData = JSON.parse(servData); } catch (e) { servData = []; }
      }

      setDirections(Array.isArray(dirData) ? dirData : []);
      setDepartements(Array.isArray(deptData) ? deptData : []);
      setServices(Array.isArray(servData) ? servData : []);
    } catch (error) {
      console.error('Erreur lors du chargement des données de référence:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAgents();
      setAgents(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des agents:', error);
      setError('Erreur lors du chargement des agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchReferenceData();
    fetchAgents(); 
  }, []);

  const handleEdit = (agent) => {
    setEditAgent(agent);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet agent ?')) {
      try {
        setLoading(true);
        await deleteAgent(id);
        setSuccess('Agent supprimé avec succès !');
        fetchAgents();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    setEditAgent(null);
    setSuccess('Agent ajouté avec succès !');
    fetchAgents();
  };

  const getRoleColor = (role) => {
    return role === 'ADMIN' ? 'error' : 'primary';
  };

  // Fonctions pour mapper les IDs vers les noms
  const getDirectionName = (directionId) => {
    if (!directionId) return '-';
    const direction = directions.find(dir => dir.id === directionId);
    return direction ? (direction.abreviation || direction.libelle) : '-';
  };

  const getDepartementName = (departementId) => {
    if (!departementId) return '-';
    const departement = departements.find(dept => dept.id === departementId);
    return departement ? departement.libelle : '-';
  };

  const getServiceName = (serviceId) => {
    if (!serviceId) return '-';
    const service = services.find(serv => serv.id === serviceId);
    return service ? service.libelle : '-';
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Gestion des Agents</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => { setEditAgent(null); setOpenForm(true); }}
        sx={{ mb: 2 }}
      >
        AJOUTER UN AGENT
      </Button>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <CircularProgress />
        </div>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>CIN</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Poste</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Direction</TableCell>
                <TableCell>Département</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Aucun agent trouvé
                  </TableCell>
                </TableRow>
              ) : (
                agents.map(agent => (
                  <TableRow key={agent.id}>
                    <TableCell>{agent.cin}</TableCell>
                    <TableCell>{agent.nom}</TableCell>
                    <TableCell>{agent.username}</TableCell>
                    <TableCell>{agent.poste}</TableCell>
                    <TableCell>
                      <Chip 
                        label={agent.role} 
                        color={getRoleColor(agent.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getDirectionName(agent.directionId)}</TableCell>
                    <TableCell>{getDepartementName(agent.departementId)}</TableCell>
                    <TableCell>{getServiceName(agent.serviceId)}</TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleEdit(agent)}
                        size="small"
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(agent.id)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editAgent ? 'Modifier un agent' : 'Ajouter un agent'}
        </DialogTitle>
        <DialogContent>
          <AgentForm
            agent={editAgent}
            onSuccess={handleFormSuccess}
            onCancel={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default AgentsList; 