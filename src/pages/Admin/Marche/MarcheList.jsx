import React, { useEffect, useState } from 'react';
import { getMarches, addMarche, deleteMarche } from '../../../api/marche';
import { getMateriels, updateMateriel, getTypes, getMarques, getModeles } from '../../../api/materiel';
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
import Checkbox from '@mui/material/Checkbox';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const MarcheList = () => {
  const [marches, setMarches] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [selectedMaterielIds, setSelectedMaterielIds] = useState([]);
  const [newMarche, setNewMarche] = useState({ name: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const location = useLocation();
  const [openRows, setOpenRows] = useState({});
  const [openTypeRows, setOpenTypeRows] = useState({});

  const getLinkedCount = (marcheId) => {
    return materiels.filter(mat =>
      mat?.marcherId === marcheId ||
      mat?.marcheId === marcheId ||
      mat?.marche?.id === marcheId ||
      mat?.marcher?.id === marcheId
    ).length;
  };

  const getLinkedMateriels = (marcheId) => {
    return materiels.filter(mat =>
      mat?.marcherId === marcheId ||
      mat?.marcheId === marcheId ||
      mat?.marche?.id === marcheId ||
      mat?.marcher?.id === marcheId
    );
  };

  const toggleRow = (id) => {
    setOpenRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const groupLinkedByType = (marcheId) => {
    const list = getLinkedMateriels(marcheId);
    const byType = {};
    const typeIdToName = Object.fromEntries(types.map(t => [t.id, t.nom]));
    list.forEach(mat => {
      const typeName = mat.type?.nom || mat.typeNom || typeIdToName[mat.typeMaterielId] || 'Sans type';
      if (!byType[typeName]) byType[typeName] = [];
      byType[typeName].push(mat);
    });
    return byType;
  };

  const toggleTypeRow = (marcheId, typeName) => {
    const key = `${marcheId}:${typeName}`;
    setOpenTypeRows(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [mRes, matRes, tRes, mkRes, mdRes] = await Promise.all([
        getMarches(),
        getMateriels(),
        getTypes(),
        getMarques(),
        getModeles()
      ]);
      setMarches(mRes.data || []);
      setMateriels(matRes.data || []);
      setTypes(tRes.data || []);
      setMarques(mkRes.data || []);
      setModeles(mdRes.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors du chargement.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newMarche.name.trim() || !newMarche.date) return;
    setLoading(true);
    try {
      const payload = { name: newMarche.name.trim(), date: newMarche.date };
      const res = await addMarche(payload);
      const createdId = res?.data?.id;
      // If backend expects linking via materiels, set marcherId on each selected matériel
      if (createdId && selectedMaterielIds.length > 0) {
        for (const matId of selectedMaterielIds) {
          const existing = materiels.find(m => m.id === matId);
          if (!existing) continue;
          const updated = {
            ...existing,
            id: existing.id,
            marcherId: createdId,
            marcheId: createdId
          };
          try {
            await updateMateriel(matId, updated);
          } catch (_) { /* ignore per item */ }
        }
      }
      setNewMarche({ name: '', date: '' });
      setSelectedMaterielIds([]);
      setSuccess('Marché créé avec succès');
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de la création du marché");
    }
    setLoading(false);
  };

  const toggleMateriel = (id) => {
    setSelectedMaterielIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDelete = async (id) => {
    const linkedCount = getLinkedCount(id);
    if (linkedCount > 0) {
      const proceed = window.confirm(`Ce marché est lié à ${linkedCount} matériel(s). Voulez-vous d'abord les détacher puis supprimer le marché ?`);
      if (!proceed) return;
      // Détacher tous les matériels liés
      const toUnlink = getLinkedMateriels(id);
      for (const mat of toUnlink) {
        try {
          const updated = { ...mat, id: mat.id, marcherId: null, marcheId: null };
          await updateMateriel(mat.id, updated);
        } catch (_) { /* ignore per item */ }
      }
    } else if (!window.confirm('Supprimer ce marché ?')) {
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await deleteMarche(id);
      setSuccess('Marché supprimé');
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || "Suppression impossible. Vérifiez qu'aucun matériel n'est lié.");
    }
    setLoading(false);
  };

  // Helper collections for the selection table
  const unlinkedMateriels = materiels.filter(m => !m.marcheId && !m.marcherId);
  const allVisibleSelected = unlinkedMateriels.length > 0 && unlinkedMateriels.every(m => selectedMaterielIds.includes(m.id));
  const someVisibleSelected = unlinkedMateriels.some(m => selectedMaterielIds.includes(m.id));
  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      // Unselect all visible
      const visibleIds = new Set(unlinkedMateriels.map(m => m.id));
      setSelectedMaterielIds(prev => prev.filter(id => !visibleIds.has(id)));
    } else {
      // Select all visible
      const addIds = unlinkedMateriels.map(m => m.id);
      setSelectedMaterielIds(prev => Array.from(new Set([...(prev || []), ...addIds])));
    }
  };

  return (
    <CardLayout title="Gestion des Marchés" navTabs={navTabs} currentPath={location.pathname}>
      <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField label="Nom" size="small" value={newMarche.name} onChange={e => setNewMarche({ ...newMarche, name: e.target.value })} required sx={{ minWidth: 200 }} />
        <TextField label="Date" type="date" size="small" value={newMarche.date} onChange={e => setNewMarche({ ...newMarche, date: e.target.value })} required sx={{ minWidth: 180 }} InputLabelProps={{ shrink: true }} />
        <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={loading}>Ajouter</Button>
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
                <TableCell />
                <TableCell>ID</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Matériels liés</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {marches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary' }}>Aucun marché trouvé.</TableCell>
                </TableRow>
              ) : (
                marches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(m => (
                  <React.Fragment key={m.id}>
                    <TableRow hover>
                      <TableCell padding="checkbox">
                        <IconButton size="small" onClick={() => toggleRow(m.id)} aria-label="expand row">
                          {openRows[m.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{m.id}</TableCell>
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{m.date}</TableCell>
                      <TableCell>{getLinkedCount(m.id)}</TableCell>
                      <TableCell align="right">
                        <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(m.id)}>Supprimer</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={!!openRows[m.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            {Object.entries(groupLinkedByType(m.id)).length === 0 ? (
                              <Box sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>Aucun matériel lié.</Box>
                            ) : (
                              Object.entries(groupLinkedByType(m.id)).map(([typeName, mats]) => {
                                const key = `${m.id}:${typeName}`;
                                const open = !!openTypeRows[key];
                                return (
                                  <Box key={key} sx={{ mb: 1, border: '1px solid #eee', borderRadius: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, bgcolor: '#f9fafb' }}>
                                      <IconButton size="small" onClick={() => toggleTypeRow(m.id, typeName)}>
                                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                      </IconButton>
                                      <Box sx={{ fontWeight: 600 }}>{typeName}</Box>
                                      <Box sx={{ ml: 'auto', color: 'text.secondary' }}>{mats.length}</Box>
                                    </Box>
                                    <Collapse in={open} timeout="auto" unmountOnExit>
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Numéro de série</TableCell>
                                            <TableCell>Marque</TableCell>
                                            <TableCell>Modèle</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {mats.map(mat => (
                                            <TableRow key={mat.id}>
                                              <TableCell>{mat.numeroSerie}</TableCell>
                                              <TableCell>{mat.marque?.nom || mat.marqueNom || (marques.find(mk => mk.id === mat.marqueId)?.nom)}</TableCell>
                                              <TableCell>{mat.modele?.nom || mat.modeleNom || (modeles.find(md => md.id === mat.modeleId)?.nom)}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </Collapse>
                                  </Box>
                                );
                              })
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination component="div" count={marches.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5,10,20,50]} labelRowsPerPage="Lignes par page" />
        </TableContainer>
      )}

      <Box sx={{ mt: 4 }}>
        <Box sx={{ mb: 1, fontWeight: 600 }}>Sélectionner des matériels à lier au marché en cours de création</Box>
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <Table>
            <TableHead sx={{ background: '#f4f6fa' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allVisibleSelected}
                    indeterminate={!allVisibleSelected && someVisibleSelected}
                    onChange={toggleSelectAllVisible}
                  />
                </TableCell>
                <TableCell>Numéro de série</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Marque</TableCell>
                <TableCell>Modèle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unlinkedMateriels.slice(0, 10).map(mat => (
                <TableRow key={mat.id}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedMaterielIds.includes(mat.id)} onChange={() => toggleMateriel(mat.id)} />
                  </TableCell>
                  <TableCell>{mat.numeroSerie}</TableCell>
                  <TableCell>{mat.type?.nom || mat.typeNom || (types.find(t => t.id === mat.typeMaterielId)?.nom)}</TableCell>
                  <TableCell>{mat.marque?.nom || mat.marqueNom || (marques.find(mk => mk.id === mat.marqueId)?.nom)}</TableCell>
                  <TableCell>{mat.modele?.nom || mat.modeleNom || (modeles.find(md => md.id === mat.modeleId)?.nom)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </CardLayout>
  );
};

export default MarcheList;


