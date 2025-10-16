import React, { useEffect, useState } from 'react';
import { getPrestataires, addPrestataire, updatePrestataire, deletePrestataire } from '../../../api/prestataire';
import { useLocation } from 'react-router-dom';
import CardLayout from '../../../components/CardLayout';
import navTabs from '../../../components/adminNavTabs';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const PrestataireList = () => {
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPrestataire, setEditingPrestataire] = useState(null);
  const [formData, setFormData] = useState({
    raisonSocial: '',
    numeroTele: ''
  });
  const location = useLocation();

  useEffect(() => {
    fetchPrestataires();
  }, []);

  const fetchPrestataires = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPrestataires();
      setPrestataires(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors du chargement des prestataires');
    }
    setLoading(false);
  };

  const handleOpenDialog = (prestataire = null) => {
    if (prestataire) {
      setEditingPrestataire(prestataire);
      setFormData({
        raisonSocial: prestataire.raisonSocial || '',
        numeroTele: prestataire.numeroTele || ''
      });
    } else {
      setEditingPrestataire(null);
      setFormData({
        raisonSocial: '',
        numeroTele: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPrestataire(null);
    setFormData({
      raisonSocial: '',
      numeroTele: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.raisonSocial.trim()) {
      setError('La raison sociale est obligatoire');
      return;
    }

    setLoading(true);
    try {
      if (editingPrestataire) {
        await updatePrestataire(editingPrestataire.id, formData);
        setSuccess('Prestataire modifié avec succès');
      } else {
        await addPrestataire(formData);
        setSuccess('Prestataire ajouté avec succès');
      }
      await fetchPrestataires();
      handleCloseDialog();
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce prestataire ?')) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await deletePrestataire(id);
      setSuccess('Prestataire supprimé avec succès');
      await fetchPrestataires();
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la suppression');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filtrer les prestataires
  const filteredPrestataires = prestataires.filter(prestataire =>
    prestataire.raisonSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prestataire.numeroTele?.includes(searchTerm)
  );

  // Réinitialiser la page quand le terme de recherche change
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  return (
    <CardLayout title="Gestion des Prestataires" navTabs={navTabs} currentPath={location.pathname}>
      {/* Barre d'outils */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Rechercher un prestataire"
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ minWidth: 300 }}
          placeholder="Raison sociale ou numéro de téléphone"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ minWidth: 150 }}
        >
          Nouveau Prestataire
        </Button>
        {searchTerm && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSearchTerm('')}
          >
            Effacer
          </Button>
        )}
      </Box>

      {/* Messages d'alerte */}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tableau */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <Table>
            <TableHead sx={{ background: '#f4f6fa' }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Raison Sociale</TableCell>
                <TableCell>Numéro de Téléphone</TableCell>
                <TableCell>Nombre de Marchés</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPrestataires.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                    {searchTerm ? 'Aucun prestataire trouvé pour cette recherche.' : 'Aucun prestataire trouvé.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrestataires
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(prestataire => (
                    <TableRow key={prestataire.id} hover>
                      <TableCell>{prestataire.id}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{prestataire.raisonSocial}</TableCell>
                      <TableCell>{prestataire.numeroTele || '-'}</TableCell>
                      <TableCell>
                        <Box component="span" sx={{ 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1, 
                          bgcolor: '#e3f2fd', 
                          color: '#1976d2',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {prestataire.marches?.length || 0} marché(s)
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(prestataire)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(prestataire.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredPrestataires.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20, 50]}
            labelRowsPerPage="Lignes par page"
          />
        </TableContainer>
      )}

      {/* Dialog d'ajout/modification */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPrestataire ? 'Modifier le Prestataire' : 'Nouveau Prestataire'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Raison Sociale *"
                name="raisonSocial"
                value={formData.raisonSocial}
                onChange={handleInputChange}
                fullWidth
                required
                placeholder="Nom de l'entreprise"
              />
              <TextField
                label="Numéro de Téléphone"
                name="numeroTele"
                value={formData.numeroTele}
                onChange={handleInputChange}
                fullWidth
                placeholder="+212 6XX XXX XXX"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : (editingPrestataire ? 'Modifier' : 'Ajouter')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </CardLayout>
  );
};

export default PrestataireList;
