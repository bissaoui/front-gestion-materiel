import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../../utils/storage';
import { API_URL } from '../../../api/auth';

const defaultEdit = { id: null, code: '', designation: '', unite: '', qte: '' };

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editArticle, setEditArticle] = useState(defaultEdit);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);

  const columns = [
    { 
      field: 'code', 
      headerName: 'Code', 
      flex: 0.8,
      filterable: true,
      sortable: true
    },
    { 
      field: 'designation', 
      headerName: 'Désignation', 
      flex: 1.5,
      filterable: true,
      sortable: true
    },
    { 
      field: 'unite', 
      headerName: 'Unité', 
      flex: 0.6,
      filterable: true,
      sortable: true
    },
    { 
      field: 'qte', 
      headerName: 'Quantité', 
      flex: 0.6, 
      type: 'number',
      filterable: true,
      sortable: true
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => params.value,
    },
  ];

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/api/articles`, { 
        headers: { Authorization: `Bearer ${getToken()}` } 
      });
      setArticles(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
      setError('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
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

  const handleSave = async () => {
    try {
      setLoading(true);
      const method = isEdit ? 'put' : 'post';
      const url = isEdit ? `${API_URL}/api/articles/${editArticle.id}` : `${API_URL}/api/articles`;
      await axios[method](url, editArticle, { headers: { Authorization: `Bearer ${getToken()}` } });
      setSuccess(isEdit ? 'Article modifié avec succès !' : 'Article ajouté avec succès !');
      fetchArticles();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet article ?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/api/articles/${id}`, { 
          headers: { Authorization: `Bearer ${getToken()}` } 
        });
        setSuccess('Article supprimé avec succès !');
        fetchArticles();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  // Filtrer les articles basé sur le terme de recherche
  const filteredArticles = articles.filter(article =>
    article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rows = filteredArticles.map(a => ({
    ...a,
    actions: (
      <Box sx={{ 
        display: 'flex', 
        gap: 0.5, 
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog(a)}
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
          <Edit sx={{ fontSize: 16, mr: 0.5 }} />
          Modifier
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={() => handleDelete(a.id)}
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
          <Delete sx={{ fontSize: 16, mr: 0.5 }} />
          Supprimer
        </Button>
      </Box>
    )
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          📦 Articles
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ minWidth: 200 }}
        >
          Ajouter un Article
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }} elevation={3}>
        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
          <TextField
            label="Rechercher par code ou désignation"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{ 
              startAdornment: <Search sx={{ mr: 1, color: 'grey.500' }} /> 
            }}
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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

      {/* Dialog pour ajout/modification */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEdit ? 'Modifier un article' : 'Ajouter un article'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField 
              label="Code" 
              name="code" 
              value={editArticle.code} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              required 
              size="small"
            />
            <TextField 
              label="Désignation" 
              name="designation" 
              value={editArticle.designation} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              required 
              size="small"
            />
            <TextField 
              label="Unité" 
              name="unite" 
              value={editArticle.unite} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              required 
              size="small"
            />
            <TextField 
              label="Quantité" 
              name="qte" 
              value={editArticle.qte} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              type="number" 
              required 
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">Annuler</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {isEdit ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ArticleList;
