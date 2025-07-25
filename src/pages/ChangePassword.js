import React, { useState } from 'react';
import { Container, TextField, Button, Alert, Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import { getToken } from '../utils/storage';
import { API_URL } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.newPassword !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setSaving(true);
    const token = getToken();
    try {
      await axios.post(`${API_URL}/api/agents/change-password`, {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Mot de passe changé avec succès !');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError('Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>Changer le mot de passe</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField label="Ancien mot de passe" name="oldPassword" value={form.oldPassword} onChange={handleChange} fullWidth margin="normal" type="password" required />
        <TextField label="Nouveau mot de passe" name="newPassword" value={form.newPassword} onChange={handleChange} fullWidth margin="normal" type="password" required />
        <TextField label="Confirmer le nouveau mot de passe" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} fullWidth margin="normal" type="password" required />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={saving}>{saving ? <CircularProgress size={24} /> : 'Changer le mot de passe'}</Button>
      </Box>
    </Container>
  );
};

export default ChangePassword; 