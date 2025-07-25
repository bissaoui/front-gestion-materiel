import React, { useEffect, useState } from 'react';
import { getTypes, getMarques, addMarque, deleteMarque } from '../../api/materiel';
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
import MenuItem from '@mui/material/MenuItem';
import CardLayout from '../../components/CardLayout';
import navTabs from '../../components/adminNavTabs';
import { marqueColumns } from '../../components/adminTableColumns';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import ListItemText from '@mui/material/ListItemText';

const MarqueList = () => {
  const [types, setTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [newMarque, setNewMarque] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMarques, setSelectedMarques] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const location = useLocation();

  useEffect(() => {
    getTypes()
      .then(res => setTypes(res.data))
      .catch(() => setTypes([]));
  }, []);

  useEffect(() => {
    const loadMarques = async () => {
      try {
        const res = await getMarques(selectedTypeFilter);
        setMarques(Array.isArray(res.data) ? res.data : []);
        console.log('marques:', res.data); // Diagnostic structure
      } catch (e) {
        setError("Erreur lors du chargement des marques");
      }
    };
    loadMarques();
  }, [selectedTypeFilter]);

  const handleAddMarque = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newMarque.trim() || selectedTypes.length === 0) {
      setError('Veuillez sélectionner au moins un type et saisir un nom de marque');
      return;
    }
    setLoading(true);
    try {
      await addMarque(newMarque, selectedTypes);
      setNewMarque('');
      setSelectedTypes([]);
      setSuccess('Marque ajoutée avec succès');
      const res = await getMarques(selectedTypeFilter);
      setMarques(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de l'ajout de la marque");
    }
    setLoading(false);
  };

  const handleDeleteMarque = async (id) => {
    if (!window.confirm('Supprimer cette marque ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await deleteMarque(id);
      setSuccess('Marque supprimée avec succès');
      const res = await getMarques(selectedTypeFilter);
      setMarques(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if (e.response?.status === 500) {
        setError("Impossible de supprimer cette marque car elle est utilisée par des modèles ou matériels.");
      } else {
        setError(e.response?.data?.message || "Erreur lors de la suppression de la marque");
      }
    }
    setLoading(false);
  };

  const handleSelectMarque = (id) => {
    setSelectedMarques(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMarques.length === marques.length) {
      setSelectedMarques([]);
    } else {
      setSelectedMarques(marques.map(m => m.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMarques.length === 0) return;
    if (!window.confirm('Supprimer toutes les marques sélectionnées ?')) return;
    setLoading(true);
    let hasError = false;
    for (const id of selectedMarques) {
      try {
        await deleteMarque(id);
      } catch (e) {
        hasError = true;
      }
    }
    if (hasError) {
      setError("Certaines marques n'ont pas pu être supprimées.");
    } else {
      setSuccess('Marques supprimées avec succès');
    }
    setSelectedMarques([]);
    const res = await getMarques();
    setMarques(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  console.log('types:', types);

  // Filtrage des marques selon le type sélectionné
  const filteredMarques = marques.filter(marque => {
    if (!selectedTypeFilter) return true;
    return (marque.typeIds || []).includes(Number(selectedTypeFilter));
  });

  return (
    <CardLayout
      title="Gestion des Marques"
      navTabs={navTabs}
      currentPath={location.pathname}
    >
      <Box component="form" onSubmit={handleAddMarque} sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Nom de la marque"
          value={newMarque}
          onChange={e => setNewMarque(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
          required
        />
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel>Types associés</InputLabel>
          <Select
            multiple
            value={selectedTypes}
            onChange={e => setSelectedTypes(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            input={<OutlinedInput label="Types associés" />}
            renderValue={selected => types.filter(t => selected.includes(String(t.id))).map(t => t.nom).join(', ')}
          >
            {types.map(type => (
              <MenuItem key={type.id} value={String(type.id)}>
                <Checkbox checked={selectedTypes.includes(String(type.id))} />
                <ListItemText primary={type.nom} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ minWidth: 140, height: 40 }}>
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Ajouter'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          disabled={selectedMarques.length === 0}
          onClick={handleDeleteSelected}
          sx={{ minWidth: 180, height: 40, ml: 2 }}
        >
          Supprimer la sélection
        </Button>
        {error && <Alert severity="error" sx={{ ml: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ ml: 2 }}>{success}</Alert>}
      </Box>
      <TextField
        select
        label="Filtrer par type"
        value={selectedTypeFilter}
        onChange={e => setSelectedTypeFilter(e.target.value)}
        size="small"
        sx={{ mb: 2, minWidth: 200 }}
      >
        <MenuItem value="">Tous les types</MenuItem>
        {types.map(type => (
          <MenuItem key={type.id} value={String(type.id)}>{type.nom}</MenuItem>
        ))}
      </TextField>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <Table>
            <TableHead sx={{ background: '#f4f6fa' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedMarques.length === marques.length && marques.length > 0}
                    onChange={handleSelectAll}
                    color="primary"
                  />
                </TableCell>
                {marqueColumns.map(col => <TableCell key={col.id}>{col.label}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMarques.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                    Aucune marque trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMarques.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(marque => (
                  <TableRow key={marque.id} hover selected={selectedMarques.includes(marque.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedMarques.includes(marque.id)}
                        onChange={() => handleSelectMarque(marque.id)}
                        color="primary"
                      />
                    </TableCell>
                    {marqueColumns.map(col => (
                      <TableCell key={col.id} align={col.id === 'action' ? '' : undefined}>
                        {col.id === 'types'
                          ? (marque.typeIds || []).map(id => {
                              const t = types.find(type => String(type.id) === String(id));
                              return t ? t.nom : '';
                            }).filter(Boolean).join(', ')
                          : col.id === 'action'
                            ? (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleDeleteMarque(marque.id)}
                                >
                                  Supprimer
                                </Button>
                              )
                            : marque[col.id]
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={marques.length}
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

export default MarqueList; 