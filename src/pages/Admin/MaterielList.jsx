import React, { useEffect, useState } from 'react';
import { getMateriels, getTypes, getMarques, getModeles, deleteMateriel, getModelesByMarqueAndType, addMateriel, updateMateriel } from '../../api/materiel';
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
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuItem from '@mui/material/MenuItem';
import CardLayout from '../../components/CardLayout';
import MaterielForm from '../../components/MaterielForm';
import navTabs from '../../components/adminNavTabs';
import { materielColumns } from '../../components/adminTableColumns';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

const MaterielList = () => {
  const [materiels, setMateriels] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  // Un seul set d’états pour le filtre ET le formulaire
  const [selectedType, setSelectedType] = useState('');
  const [selectedMarque, setSelectedMarque] = useState('');
  const [selectedModele, setSelectedModele] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedMateriels, setSelectedMateriels] = useState([]);
  const [allModeles, setAllModeles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState('');
  const [editErrors, setEditErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [confirmMultiOpen, setConfirmMultiOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMateriels(),
      getTypes(),
      getMarques(),
      getModeles()
    ]).then(([matRes, typeRes, marqueRes, modeleRes]) => {
      setMateriels(Array.isArray(matRes.data) ? matRes.data : []);
      setTypes(Array.isArray(typeRes.data) ? typeRes.data : []);
      setMarques(Array.isArray(marqueRes.data) ? marqueRes.data : []);
      setModeles(Array.isArray(modeleRes.data) ? modeleRes.data : []);
    }).catch(() => setError("Erreur lors du chargement des données"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getModeles().then(res => setAllModeles(Array.isArray(res.data) ? res.data : []));
  }, []);

  useEffect(() => {
    if (selectedType) {
      getMarques(selectedType)
        .then(res => setMarques(Array.isArray(res.data) ? res.data : []))
        .catch(() => setMarques([]));
    } else {
      setMarques([]);
      setSelectedMarque('');
    }
    setModeles([]);
  }, [selectedType]);

  useEffect(() => {
    if (selectedType && selectedMarque) {
      setLoading(true);
      getModelesByMarqueAndType(selectedMarque, selectedType)
        .then(res => setModeles(Array.isArray(res.data) ? res.data : []))
        .catch(() => setModeles([]))
        .finally(() => setLoading(false));
    } else if (selectedType && !selectedMarque) {
      setLoading(true);
      getModelesByMarqueAndType(null, selectedType)
        .then(res => setModeles(Array.isArray(res.data) ? res.data : []))
        .catch(() => setModeles([]))
        .finally(() => setLoading(false));
    } else if (!selectedType && selectedMarque) {
      setLoading(true);
      getModelesByMarqueAndType(selectedMarque, null)
        .then(res => setModeles(Array.isArray(res.data) ? res.data : []))
        .catch(() => setModeles([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(true);
      getModelesByMarqueAndType()
        .then(res => setModeles(Array.isArray(res.data) ? res.data : []))
        .catch(() => setModeles([]))
        .finally(() => setLoading(false));
    }
  }, [selectedMarque, selectedType]);

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await deleteMateriel(id);
      setSuccess('Matériel supprimé avec succès');
      const res = await getMateriels();
      setMateriels(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de la suppression du matériel");
    }
    setLoading(false);
  };

  const handleDeleteWithConfirm = (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (toDeleteId) {
      await handleDelete(toDeleteId);
      setToDeleteId(null);
      setConfirmOpen(false);
    }
  };

  // Fonction d’ajout de matériel
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!numeroSerie.trim() || !selectedType || !selectedMarque || !selectedModele) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setLoading(true);
    const body = {
      numeroSerie,
      typeMaterielId: selectedType,
      marqueId: selectedMarque,
      modeleId: selectedModele
    };
    try {
      await addMateriel(body);
      setSuccess('Matériel ajouté avec succès !');
      setNumeroSerie('');
      setSelectedType('');
      setSelectedMarque('');
      setSelectedModele('');
      // Rafraîchir la liste
      const res = await getMateriels();
      setMateriels(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de l'ajout du matériel.");
    }
    setLoading(false);
  };

  const handleUpdateNumeroSerie = async (id) => {
    if (!editValue.trim()) return;
    const mat = materiels.find(m => m.id === id);
    if (!mat) return;
    const updated = {
      ...mat,
      numeroSerie: editValue,
      id: mat.id // s'assurer que l'id est bien présent
    };
    console.log('Objet envoyé à updateMateriel:', updated);
    try {
      await updateMateriel(id, updated);
      setEditingId(null);
      setEditErrors(prev => ({ ...prev, [id]: '' }));
      // Rafraîchir la liste
      const res = await getMateriels();
      setMateriels(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setEditErrors(prev => ({
        ...prev,
        [id]: e.response?.data?.message || 'Erreur lors de la modification'
      }));
      console.error('Erreur updateMateriel:', e);
    }
  };

  // Filtrage
  const filteredMateriels = materiels.filter(m => {
    const matchNumSerie = m.numeroSerie?.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType ? m.typeMaterielId === Number(selectedType) : true;
    const matchMarque = selectedMarque ? m.marqueId === Number(selectedMarque) : true;
    const matchModele = selectedModele ? m.modeleId === Number(selectedModele) : true;
    return matchNumSerie && matchType && matchMarque && matchModele;
  });

  // Pagination logic
  const indexOfLastItem = (page + 1) * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredMateriels.slice(indexOfFirstItem, indexOfLastItem);

  // Calculer si au moins un matériel sélectionné est non affecté (comme pour les modèles)
  const hasDeletableSelected = selectedMateriels.some(id => {
    const mat = materiels.find(m => m.id === id);
    return mat && !mat.agentId;
  });

  const handleSelectMateriel = (id) => {
    setSelectedMateriels(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    const selectable = currentItems.filter(m => !m.agentId).map(m => m.id);
    if (selectedMateriels.length === selectable.length) {
      setSelectedMateriels([]);
    } else {
      setSelectedMateriels(selectable);
    }
  };

  const handleDeleteSelected = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await Promise.all(selectedMateriels.map(id => deleteMateriel(id)));
      setSuccess('Matériels supprimés avec succès');
      const res = await getMateriels();
      setMateriels(Array.isArray(res.data) ? res.data : []);
      setSelectedMateriels([]); // Clear selected after deletion
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de la suppression des matériels");
    }
    setLoading(false);
  };

  return (
    <CardLayout
      title="Liste des Matériels"
      navTabs={navTabs}
      currentPath={location.pathname}
    >

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Recherche par numéro de série"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          label="Type"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Tous les types</MenuItem>
          {types.map(type => (
            <MenuItem key={type.id} value={String(type.id)}>{type.nom}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Marque"
          value={selectedMarque}
          onChange={e => setSelectedMarque(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
          disabled={!selectedType}
        >
          <MenuItem value="">Toutes les marques</MenuItem>
          {marques.map(marque => (
            <MenuItem key={marque.id} value={String(marque.id)}>{marque.nom}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Modèle"
          value={selectedModele}
          onChange={e => setSelectedModele(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
          disabled={!selectedMarque}
        >
          <MenuItem value="">Tous les modèles</MenuItem>
          {modeles
            .filter(mo => !selectedMarque || String(mo.marqueId) === String(selectedMarque))
            .map(modele => (
              <MenuItem key={modele.id} value={String(modele.id)}>{modele.nom}</MenuItem>
            ))}
        </TextField>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            setSelectedType('');
            setSelectedMarque('');
            setSelectedModele('');
            setSearch('');
            getMarques().then(res => setMarques(Array.isArray(res.data) ? res.data : []));
          }}
          sx={{ ml: 2, height: 40 }}
        >
          RÉINITIALISER LE FILTRE
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          disabled={!hasDeletableSelected}
          onClick={() => setConfirmMultiOpen(true)}
          sx={{ minWidth: 180, height: 40, ml: 2 }}
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
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedMateriels.length === currentItems.filter(m => !m.agentId).length && currentItems.filter(m => !m.agentId).length > 0}
                    indeterminate={selectedMateriels.length > 0 && selectedMateriels.length < currentItems.filter(m => !m.agentId).length}
                    onChange={handleSelectAll}
                    color="primary"
                  />
                </TableCell>
                {materielColumns.map(col => <TableCell key={col.id} align={col.id === 'action' ? 'right' : undefined}>{col.label}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={materielColumns.length + 2} align="center" sx={{ color: 'text.secondary' }}>
                    Aucun matériel trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map(m => {
                  console.log('materiel:', m);
                  console.log('modeles:', modeles);
                  return (
                    <TableRow key={m.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedMateriels.includes(m.id)}
                          onChange={() => handleSelectMateriel(m.id)}
                          color="primary"
                          disabled={!!m.agentId}
                        />
                      </TableCell>
                      {materielColumns.map(col => (
                        col.id === 'action' ? (
                          <TableCell key={col.id} align="right">
                            <Tooltip title={m.agentId ? "Impossible de supprimer : matériel affecté" : ""}>
                              <span>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleDeleteWithConfirm(m.id)}
                                  disabled={!!m.agentId}
                                >
                                  Supprimer
                                </Button>
                              </span>
                            </Tooltip>
                          </TableCell>
                        ) : (
                          col.id === 'numeroSerie' && editingId === m.id ? (
                            <TextField
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              size="small"
                              onBlur={() => handleUpdateNumeroSerie(m.id)}
                              onKeyDown={e => e.key === 'Enter' && handleUpdateNumeroSerie(m.id)}
                              autoFocus
                              error={!!editErrors[m.id]}
                              helperText={editErrors[m.id]}
                            />
                          ) : (
                            col.id === 'numeroSerie' ? (
                              <TableCell key={col.id}>
                                <>
                                  {m.numeroSerie}
                                  <IconButton size="small" onClick={() => { setEditingId(m.id); setEditValue(m.numeroSerie); }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </>
                              </TableCell>
                            ) : (
                              col.id === 'modele' ? (
                                <TableCell key={col.id}>{
                                  (() => {
                                    const modeleObj = allModeles.find(mo => String(mo.id) === String(m.modeleId));
                                    return modeleObj ? modeleObj.nom : <span style={{color:'#aaa'}}>Modèle introuvable</span>;
                                  })()
                                }</TableCell>
                              ) : (
                                <TableCell key={col.id}>{
                                  col.id === 'type' ? (types.find(t => String(t.id) === String(m.typeMaterielId))?.nom || '-') :
                                  col.id === 'marque' ? (marques.find(ma => String(ma.id) === String(m.marqueId))?.nom || '-') :
                                  m[col.id]
                                }</TableCell>
                              )
                            )
                          )
                        )
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredMateriels.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            labelRowsPerPage="Lignes par page"
          />
        </TableContainer>
      )}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce matériel ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmMultiOpen} onClose={() => setConfirmMultiOpen(false)}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer tous les matériels sélectionnés ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmMultiOpen(false)}>Annuler</Button>
          <Button
            onClick={async () => {
              await handleDeleteSelected();
              setConfirmMultiOpen(false);
            }}
            color="error"
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </CardLayout>
  );
};

export default MaterielList; 