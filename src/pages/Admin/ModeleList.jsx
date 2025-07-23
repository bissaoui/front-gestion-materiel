import React, { useEffect, useState } from 'react';
import { getTypes, getMarques, addModele, deleteModele, getModelesByMarqueAndType, getMateriels } from '../../api/materiel';
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
import MaterielForm from '../../components/MaterielForm';
import navTabs from '../../components/adminNavTabs';
import { modeleColumns } from '../../components/adminTableColumns';
import Tooltip from '@mui/material/Tooltip';

const ModeleList = () => {
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [marques, setMarques] = useState([]);
  const [selectedMarque, setSelectedMarque] = useState('');
  const [modeles, setModeles] = useState([]);
  const [newModele, setNewModele] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedModeles, setSelectedModeles] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [materiels, setMateriels] = useState([]);
  const location = useLocation();

  useEffect(() => {
    getTypes()
      .then(res => setTypes(res.data))
      .catch(() => setTypes([]));
    getMarques()
      .then(res => setMarques(Array.isArray(res.data) ? res.data : []))
      .catch(() => setMarques([]));
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

  useEffect(() => {
    getMateriels().then(res => setMateriels(Array.isArray(res.data) ? res.data : []));
  }, []);

  const handleAddModele = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newModele.trim() || !selectedMarque || !selectedType) return;
    setLoading(true);
    try {
      await addModele(newModele, selectedMarque, selectedType);
      setNewModele('');
      setSuccess('Modèle ajouté avec succès');
      const res = await getModelesByMarqueAndType(selectedMarque, selectedType);
      setModeles(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de l'ajout du modèle");
    }
    setLoading(false);
  };

  const handleDeleteModele = async (id) => {
    if (!window.confirm('Supprimer ce modèle ?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await deleteModele(id);
      setSuccess('Modèle supprimé avec succès');
      const res = await getModelesByMarqueAndType(selectedMarque, selectedType);
      setModeles(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if (e.response?.status === 500) {
        setError("Impossible de supprimer ce modèle car il est utilisé par des matériels.");
      } else {
        setError(e.response?.data?.message || "Erreur lors de la suppression du modèle");
      }
    }
    setLoading(false);
  };

  const handleSelectModele = (id) => {
    setSelectedModeles(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const selectable = currentItems
      .filter(modele => !materiels.some(m => m.modeleId === modele.id))
      .map(modele => modele.id);
    if (selectedModeles.length === selectable.length) {
      setSelectedModeles([]);
    } else {
      setSelectedModeles(selectable);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedModeles.length === 0) return;
    if (!window.confirm('Supprimer tous les modèles sélectionnés ?')) return;
    setLoading(true);
    let hasError = false;
    let usedCount = 0;
    for (const id of selectedModeles) {
      if (materiels.some(m => m.modeleId === id)) {
        usedCount++;
        continue;
      }
      try {
        await deleteModele(id);
      } catch (e) {
        hasError = true;
      }
    }
    if (usedCount > 0) {
      setError(`Certains modèles n'ont pas pu être supprimés car ils sont utilisés.`);
    } else if (hasError) {
      setError("Erreur lors de la suppression de certains modèles.");
    } else {
      setSuccess('Modèles supprimés avec succès');
    }
    setSelectedModeles([]);
    const res = await getModelesByMarqueAndType(selectedMarque, selectedType);
    setModeles(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  // Filtrage par recherche
  const filteredModeles = modeles.filter(modele =>
    modele.nom.toLowerCase().includes(search.toLowerCase())
  );
  // Tri
  const sortedModeles = [...filteredModeles].sort((a, b) => {
    let aValue, bValue;
    switch (sortConfig.key) {
      case "type":
        aValue = types.find(t => t.id === a.typeMaterielId)?.nom || "";
        bValue = types.find(t => t.id === b.typeMaterielId)?.nom || "";
        break;
      case "marque":
        aValue = marques.find(m => m.id === a.marqueId)?.nom || "";
        bValue = marques.find(m => m.id === b.marqueId)?.nom || "";
        break;
      case "nom":
        aValue = a.nom;
        bValue = b.nom;
        break;
      default:
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
    }
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
  // Pagination (à garder après le tri et le filtrage)
  const indexOfLastItem = (page + 1) * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = sortedModeles.slice(indexOfFirstItem, indexOfLastItem);

  console.log('marques:', marques);
  console.log('modeles:', modeles);

  return (
    <CardLayout
      title="Gestion des Modèles"
      navTabs={navTabs}
      currentPath={location.pathname}
    >
    
            <Box component="form" onSubmit={handleAddModele} sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          select
          label="Type"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
          required
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
          required
          disabled={!selectedType}
        >
          <MenuItem value="">Toutes les marques</MenuItem>
          {marques.map(marque => (
            <MenuItem key={marque.id} value={String(marque.id)}>{marque.nom}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Nom du modèle"
          value={newModele}
          onChange={e => setNewModele(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
          required
          disabled={!selectedMarque}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!selectedType || !selectedMarque || !newModele.trim()}
          sx={{ minWidth: 180, height: 40 }}
        >
          Ajouter un modèle
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          disabled={selectedModeles.length === 0}
          onClick={handleDeleteSelected}
          sx={{ minWidth: 180, height: 40 }}
        >
          Supprimer la sélection
        </Button>
      </Box>
      <TextField
        label="Rechercher un modèle..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 2, minWidth: 200 }}
      />
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
                    checked={selectedModeles.length === currentItems.filter(modele => !materiels.some(m => m.modeleId === modele.id)).length && currentItems.filter(modele => !materiels.some(m => m.modeleId === modele.id)).length > 0}
                    indeterminate={selectedModeles.length > 0 && selectedModeles.length < currentItems.filter(modele => !materiels.some(m => m.modeleId === modele.id)).length}
                    onChange={handleSelectAll}
                    color="primary"
                  />
                </TableCell>
                {modeleColumns.map(col => <TableCell key={col.id} align={col.id === 'action' ? 'right' : undefined}>{col.label}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={modeleColumns.length + 2} align="center" sx={{ color: 'text.secondary' }}>
                    Aucun modèle trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map(modele => (
                  <TableRow key={modele.id} hover selected={selectedModeles.includes(modele.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedModeles.includes(modele.id)}
                        onChange={() => handleSelectModele(modele.id)}
                        color="primary"
                        disabled={materiels.some(m => m.modeleId === modele.id)}
                      />
                    </TableCell>
                    {modeleColumns.map(col => (
                      <TableCell key={col.id} align={col.id === 'action' ? 'right' : undefined}>
                        {col.id === 'type'
                          ? (types.find(t => String(t.id) === String(modele.typeMaterielId))?.nom || '-')
                          : col.id === 'marque'
                            ? (marques.find(m => String(m.id) === String(modele.marqueId))?.nom || '-')
                            : col.id === 'action'
                              ? (
                                  <Tooltip title={materiels.some(m => m.modeleId === modele.id) ? "Impossible de supprimer : modèle utilisé" : ""}>
                                    <span>
                                      <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => handleDeleteModele(modele.id)}
                                        disabled={materiels.some(m => m.modeleId === modele.id)}
                                      >
                                        Supprimer
                                      </Button>
                                    </span>
                                  </Tooltip>
                                )
                              : col.id === 'modele'
                                ? modele.nom
                                : modele[col.id]
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
            count={sortedModeles.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            labelRowsPerPage="Lignes par page"
          />
        </TableContainer>
      )}
    </CardLayout>
  );
};

export default ModeleList; 