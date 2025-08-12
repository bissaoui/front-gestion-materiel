import React, { useEffect, useState } from 'react';
import { getTypes, addType, deleteType } from '../../../api/materiel';
import { Link, useLocation } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CardLayout from '../../../components/CardLayout';
import navTabs from '../../../components/adminNavTabs';
import { typeColumns } from '../../../components/adminTableColumns';

const TypeList = () => {
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const location = useLocation();

  const fetchTypes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTypes();
      setTypes(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors du chargement des types");
    }
    setLoading(false);
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleAddType = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newType.trim()) return;
    setLoading(true);
    try {
      await addType(newType);
      setNewType('');
      setSuccess('Type ajouté avec succès');
      fetchTypes();
    } catch (e) {
      const backendMsg = typeof e.response?.data === 'string'
        ? e.response.data
        : e.response?.data?.message || e.response?.data?.error || '';
      if (backendMsg.toLowerCase().includes('existe déjà')) {
        setError('Ce type existe déjà. Veuillez choisir un autre nom.');
      } else {
        setError(backendMsg || "Erreur lors de l'ajout du type");
      }
      fetchTypes();
    }
    setLoading(false);
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm('Supprimer ce type ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await deleteType(id);
      setSuccess('Type supprimé avec succès');
      fetchTypes();
    } catch (e) {
      if (e.response?.status === 500) {
        setError("Impossible de supprimer ce type car il est utilisé par des marques, modèles ou matériels.");
      } else {
        setError(e.response?.data?.message || "Erreur lors de la suppression du type");
      }
    }
    setLoading(false);
  };

  const handleSelectType = (id) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTypes.length === types.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(types.map(t => t.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTypes.length === 0) return;
    if (!window.confirm('Supprimer tous les types sélectionnés ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    let hasError = false;
    for (const id of selectedTypes) {
      try {
        await deleteType(id);
      } catch (e) {
        hasError = true;
      }
    }
    if (hasError) {
      setError("Certains types n'ont pas pu être supprimés car ils sont utilisés.");
    } else {
      setSuccess('Types supprimés avec succès');
    }
    setSelectedTypes([]);
    fetchTypes();
    setLoading(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <CardLayout
      title="Gestion des Types de Matériel"
      navTabs={navTabs}
      currentPath={location.pathname}
    >
      <Box component="form" onSubmit={handleAddType} sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Nouveau type"
          value={newType}
          onChange={e => setNewType(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
          required
        />
        <Button type="submit" variant="contained" color="primary" startIcon={<AddIcon />} sx={{ minWidth: 140, height: 40 }}>
          Ajouter
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          disabled={selectedTypes.length === 0}
          onClick={handleDeleteSelected}
          sx={{ minWidth: 180, height: 40 }}
        >
          Supprimer la sélection
        </Button>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <Table>
            <TableHead sx={{ background: '#f4f6fa' }}>
              {typeColumns.map(col => <TableCell key={col.id}>{col.label}</TableCell>)}
            </TableHead>
            <TableBody>
              {types.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                    Aucun type trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                types.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(type => (
                  <TableRow key={type.id} hover selected={selectedTypes.includes(type.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedTypes.includes(type.id)}
                        onChange={() => handleSelectType(type.id)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{type.id}</TableCell>
                    <TableCell>{type.nom}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteType(type.id)}
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={types.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            labelRowsPerPage="Lignes par page"
          />
        </TableContainer>
      )}
    </CardLayout>
  );
};

export default TypeList; 