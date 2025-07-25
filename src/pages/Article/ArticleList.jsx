import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { getToken } from '../../utils/storage';
import { API_URL } from '../../api/auth';

const columns = [
  { field: 'code', headerName: 'Code', flex: 1 },
  { field: 'designation', headerName: 'Désignation', flex: 2 },
  { field: 'unite', headerName: 'Unité', flex: 1 },
  { field: 'qte', headerName: 'Quantité', flex: 1, type: 'number' },
  {
    field: 'actions',
    headerName: 'Actions',
    flex: 1,
    sortable: false,
    renderCell: (params) => params.value,
  },
];

const defaultEdit = { id: null, code: '', designation: '', unite: '', qte: '' };

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editArticle, setEditArticle] = useState(defaultEdit);
  const [isEdit, setIsEdit] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  const fetchArticles = () => {
    axios.get(`${API_URL}/api/articles`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(res => setArticles(res.data))
      .catch(() => setSnackbar({ open: true, message: 'Erreur de chargement', severity: 'error' }));
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleOpenDialog = (article = defaultEdit) => {
    setEditArticle(article);
    setIsEdit(!!article.id);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditArticle(defaultEdit);
  };
  const handleChange = e => {
    setEditArticle({ ...editArticle, [e.target.name]: e.target.value });
  };
  const handleSave = () => {
    const method = isEdit ? 'put' : 'post';
    const url = isEdit ? `${API_URL}/api/articles/${editArticle.id}` : `${API_URL}/api/articles`;
    axios[method](url, editArticle, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(() => {
        fetchArticles();
        setSnackbar({ open: true, message: isEdit ? 'Article modifié' : 'Article ajouté', severity: 'success' });
        handleCloseDialog();
      })
      .catch(() => setSnackbar({ open: true, message: 'Erreur lors de la sauvegarde', severity: 'error' }));
  };
  const handleDelete = id => {
    axios.delete(`${API_URL}/api/articles/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(() => {
        fetchArticles();
        setSnackbar({ open: true, message: 'Article supprimé', severity: 'success' });
      })
      .catch(() => setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' }));
    setDeleteId(null);
  };

  const filtered = articles.filter(a =>
    a.code.toLowerCase().includes(search.toLowerCase()) ||
    a.designation.toLowerCase().includes(search.toLowerCase()) ||
    a.unite.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filtered.map(a => ({
    ...a,
    actions: (
      <Stack direction="row" spacing={1}>
        <IconButton color="primary" onClick={() => handleOpenDialog(a)}><EditIcon /></IconButton>
        <IconButton color="error" onClick={() => setDeleteId(a.id)}><DeleteIcon /></IconButton>
      </Stack>
    )
  }));

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight={700} color="primary.main">Gestion des Articles</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ minWidth: 180, mt: { xs: 2, md: 0 } }}>
          Ajouter un article
        </Button>
      </Box>
      <Box sx={{ mb: 2, maxWidth: 400 }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'grey.500' }} /> }}
        />
      </Box>
      <Box sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 2 }}>
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          rowsPerPageOptions={[5, 10, 20, 50]}
          disableSelectionOnClick
          sx={{ border: 0 }}
        />
      </Box>
      {/* Dialog pour ajout/modification */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{isEdit ? 'Modifier l\'article' : 'Ajouter un article'}</DialogTitle>
        <DialogContent>
          <TextField label="Code" name="code" value={editArticle.code} onChange={handleChange} fullWidth margin="normal" required />
          <TextField label="Désignation" name="designation" value={editArticle.designation} onChange={handleChange} fullWidth margin="normal" required />
          <TextField label="Unité" name="unite" value={editArticle.unite} onChange={handleChange} fullWidth margin="normal" required />
          <TextField label="Quantité" name="qte" value={editArticle.qte} onChange={handleChange} fullWidth margin="normal" type="number" required />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
      {/* Dialog de confirmation suppression */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>Voulez-vous vraiment supprimer cet article ?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Annuler</Button>
          <Button onClick={() => handleDelete(deleteId)} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ArticleList;
