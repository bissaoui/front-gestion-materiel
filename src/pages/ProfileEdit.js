import React, { useEffect, useState } from 'react';
import { Container, TextField, Button, Alert, Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import { getToken } from '../utils/storage';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api/auth';

const ProfileEdit = () => {
  const [form, setForm] = useState({ name: '', email: '', poste: '', directionName: '', serviceName: '', departementName: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Aucun token trouvé !');
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const cin = decoded.cin;
      axios.get(`${API_URL}/api/agents/cin/${cin}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setForm({
            name: res.data.name || '',
            email: res.data.email || '',
            poste: res.data.poste || '',
            directionName: res.data.directionName || '',
            serviceName: res.data.serviceName || '',
            departementName: res.data.departementName || ''
          });
          setLoading(false);
        })
        .catch(() => {
          setError('Erreur lors du chargement du profil');
          setLoading(false);
        });
    } catch (e) {
      setError('Erreur lors du décodage du token');
      setLoading(false);
    }
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const token = getToken();
    try {
      await axios.put(`${API_URL}/api/agents/update-profile`, form, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Profil mis à jour avec succès !');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>Modifier le profil</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField label="Nom" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" type="email" required />
        <TextField label="Poste" name="poste" value={form.poste} onChange={handleChange} fullWidth margin="normal" />
        <TextField label="Direction" name="directionName" value={form.directionName} onChange={handleChange} fullWidth margin="normal" />
        <TextField label="Service" name="serviceName" value={form.serviceName} onChange={handleChange} fullWidth margin="normal" />
        <TextField label="Département" name="departementName" value={form.departementName} onChange={handleChange} fullWidth margin="normal" />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={saving}>{saving ? <CircularProgress size={24} /> : 'Enregistrer'}</Button>
      </Box>
    </Container>
  );
};

export default ProfileEdit; 