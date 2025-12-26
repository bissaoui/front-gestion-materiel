import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Grid, Alert, CircularProgress, Tooltip, Typography } from '@mui/material';
import { createAgent, updateAgent, getDirections, getDepartements, getServices } from '../../../api/agents';

const roles = ['ADMIN', 'USER'];
const postes = ['cadre', 'chef de service', 'chef de département', 'directeur'];

const AgentForm = ({ agent, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    cin: '',
    username: '',
    password: '',
    nom: '',
    poste: '',
    role: 'USER',
    direction: '',
    departement: '',
    service: ''
  });

  const [directions, setDirections] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger les données de référence (toutes en même temps pour l'instant)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Charger toutes les données en parallèle
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
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données de référence');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (agent && directions.length > 0 && departements.length > 0 && services.length > 0) {
      setForm({ 
        cin: agent.cin || '',
        username: agent.username || '',
        password: '',
        nom: agent.nom || '',
        poste: agent.poste || '',
        role: agent.role || 'USER',
        direction: agent.directionId ? String(agent.directionId) : '',
        departement: agent.departementId ? String(agent.departementId) : '',
        service: agent.serviceId ? String(agent.serviceId) : ''
      });
      
      // Pas besoin de charger les départements/services car ils sont déjà chargés
      // et le filtrage se fait côté frontend
    }
  }, [agent, directions, departements, services]);

  const handleChange = e => {
    const { name, value } = e.target;
    
    // Pour les champs numériques (direction, departement, service), garder comme chaîne pour la cohérence
    let processedValue = value;
    if (['direction', 'departement', 'service'].includes(name)) {
      processedValue = value === '' ? '' : value; // Garder comme chaîne
    }
    
    setForm(prev => ({ 
      ...prev, 
      [name]: processedValue
    }));
    setError('');
    setSuccess('');
  };



  // Filtrage côté frontend (temporaire en attendant les endpoints backend)
  const filteredDepartements = form.direction 
    ? departements.filter(dept => dept.directionId === Number(form.direction))
    : departements;

  const filteredServices = form.departement 
    ? services.filter(serv => serv.departementId === Number(form.departement))
    : services;

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔍 Form state avant soumission:', form);
      
      // Préparer les données en convertissant les IDs en nombres
      const submitData = {
        cin: form.cin,
        username: form.username,
        password: form.password,
        nom: form.nom,
        poste: form.poste,
        role: form.role,
        directionId: form.direction ? Number(form.direction) : null,
        departementId: form.departement ? Number(form.departement) : null,
        serviceId: form.service ? Number(form.service) : null
      };
      
      console.log('📤 Données envoyées au backend:', submitData);

      if (agent) {
        await updateAgent(agent.id, submitData);
        setSuccess('Agent modifié avec succès !');
      } else {
        await createAgent(submitData);
        setSuccess('Agent ajouté avec succès !');
      }
      
      // Attendre un peu pour que l'utilisateur voie le message de succès
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !agent) {
    return (
      <Grid container justifyContent="center" sx={{ py: 4 }}>
        <CircularProgress />
      </Grid>
    );
  }

  // Afficher un loader si on est en mode édition mais que les données ne sont pas encore chargées
  if (agent && (directions.length === 0 || departements.length === 0 || services.length === 0)) {
    return (
      <Grid container justifyContent="center" sx={{ py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Chargement des données de référence...</Typography>
      </Grid>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <TextField 
            label="CIN" 
            name="cin" 
            value={form.cin} 
            onChange={handleChange} 
            required 
            fullWidth 
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            label="Prenom" 
            name="nom" 
            value={form.nom} 
            onChange={handleChange} 
            required 
            fullWidth 
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            label="NOM" 
            name="username" 
            value={form.username} 
            onChange={handleChange} 
            required 
            fullWidth 
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            label="Mot de passe" 
            name="password" 
            value={form.password} 
            onChange={handleChange} 
            type="password" 
            required={!agent} 
            fullWidth 
            size="small"
            autoComplete="new-password"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Poste"
            name="poste"
            value={form.poste || ''}
            onChange={handleChange}
            fullWidth
            size="small"
          >
            <MenuItem value="">Sélectionner un poste</MenuItem>
            {postes.map(poste => (
              <MenuItem key={poste} value={poste}>
                {poste.charAt(0).toUpperCase() + poste.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Rôle"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            fullWidth
            size="small"
          >
            {roles.map(role => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </TextField>
        </Grid>
        
        {/* Direction */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Direction"
            name="direction"
            value={form.direction || ''}
            onChange={handleChange}
            fullWidth
            size="small"
            helperText={directions.length === 0 ? "Aucune direction disponible" : `${directions.length} direction(s) disponible(s)`}
          >
            <MenuItem value="">Sélectionner une direction</MenuItem>
            {Array.isArray(directions) && directions.length > 0 ? (
              directions.map(dir => (
                <MenuItem key={dir.id} value={String(dir.id)}>
                  <Tooltip title={dir.libelle} placement="right">
                    <span>{dir.abreviation || dir.libelle}</span>
                  </Tooltip>
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Aucune direction disponible</MenuItem>
            )}
          </TextField>
        </Grid>

                 {/* Département */}
         <Grid item xs={12} sm={6}>
           <TextField
             select
             label="Département"
             name="departement"
             value={form.departement || ''}
             onChange={handleChange}
             fullWidth
             size="small"
                           disabled={!form.direction}
              helperText={
                !form.direction ? "Sélectionnez d'abord une direction" :
                filteredDepartements.length === 0 ? "Aucun département disponible" : 
                `${filteredDepartements.length} département(s) disponible(s)`
              }
           >
             <MenuItem value="">Sélectionner un département</MenuItem>
                           {Array.isArray(filteredDepartements) && filteredDepartements.length > 0 ? (
                filteredDepartements.map(dept => (
                  <MenuItem key={dept.id} value={String(dept.id)}>{dept.libelle}</MenuItem>
                ))
              ) : (
                <MenuItem disabled>Aucun département disponible</MenuItem>
              )}
           </TextField>
         </Grid>

                 {/* Service */}
         <Grid item xs={12} sm={6}>
           <TextField
             select
             label="Service"
             name="service"
             value={form.service || ''}
             onChange={handleChange}
             fullWidth
             size="small"
                           disabled={!form.departement}
              helperText={
                !form.departement ? "Sélectionnez d'abord un département" :
                filteredServices.length === 0 ? "Aucun service disponible" : 
                `${filteredServices.length} service(s) disponible(s)`
              }
           >
             <MenuItem value="">Sélectionner un service</MenuItem>
                           {Array.isArray(filteredServices) && filteredServices.length > 0 ? (
                filteredServices.map(serv => (
                  <MenuItem key={serv.id} value={String(serv.id)}>{serv.libelle}</MenuItem>
                ))
              ) : (
                <MenuItem disabled>Aucun service disponible</MenuItem>
              )}
           </TextField>
         </Grid>
      </Grid>
      
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {agent ? 'Modifier' : 'Ajouter'}
          </Button>
        </Grid>
        <Grid item>
          <Button 
            onClick={onCancel} 
            variant="outlined"
            disabled={loading}
          >
            Annuler
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default AgentForm; 