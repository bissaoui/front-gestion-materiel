import React, { useEffect, useState } from 'react';
import { getMarches, addMarche, deleteMarche } from '../../../api/marche';
import { getMateriels, updateMateriel, getTypes, getMarques, getModeles } from '../../../api/materiel';
import { getAgents } from '../../../api/agents';
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
import PrintIcon from '@mui/icons-material/Print';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DechargePrint from '../../../components/DechargePrint';

const MarcheList = () => {
  const [marches, setMarches] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedMaterielIds, setSelectedMaterielIds] = useState([]);
  const today = new Date().toISOString().slice(0, 10);
  const [newMarche, setNewMarche] = useState({ name: '', date: today });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const location = useLocation();
  const [openRows, setOpenRows] = useState({});
  const [openTypeRows, setOpenTypeRows] = useState({});
  const [dechargeDialog, setDechargeDialog] = useState({ open: false, materiel: null, agent: null });

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


  const handleCloseDecharge = () => {
    setDechargeDialog({ open: false, materiel: null, agent: null });
  };

  const handlePrintDechargeDirect = (materiel) => {
    const enrichedMateriel = {
      ...materiel,
      type: { nom: materiel.type?.nom || materiel.typeNom || (types.find(t => t.id === materiel.typeMaterielId)?.nom) || 'N/A' },
      marque: { nom: materiel.marque?.nom || materiel.marqueNom || (marques.find(mk => mk.id === materiel.marqueId)?.nom) || 'N/A' },
      modele: { nom: materiel.modele?.nom || materiel.modeleNom || (modeles.find(md => md.id === materiel.modeleId)?.nom) || 'N/A' },
      marche: { name: materiel.marche?.name || materiel.marcheNom || 'N/A' }
    };
    
    // Utiliser le même format que les décharges multiples
    const dechargeContent = generateMultipleDechargesContent('DÉCHARGE', [enrichedMateriel], null);
    
    // Ouvrir la fenêtre d'impression directement
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(dechargeContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé avant d'imprimer
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        
        // Fermer la fenêtre après l'impression ou l'annulation
        setTimeout(() => {
          printWindow.close();
        }, 300);
      };
      
      // Fermer la fenêtre si l'utilisateur la ferme manuellement
      printWindow.addEventListener('beforeunload', () => {
        setTimeout(() => {
          printWindow.close();
        }, 100);
      });
    } else {
      console.error('Impossible d\'ouvrir la fenêtre d\'impression');
      setError('Impossible de générer la décharge');
    }
  };

  const handlePrintAllDechargesForType = (typeName, materiels) => {
    console.log(`Génération d'un PDF avec ${materiels.length} décharges pour le type: ${typeName}`);
    console.log('typeName:', typeName);
    console.log('materiels:', materiels);
    
    // Récupérer le nom du marché depuis la liste des marchés
    let marcheName = 'N/A';
    if (materiels.length > 0) {
      const marcheId = materiels[0].marcheId || materiels[0].marcherId || materiels[0].marche?.id || materiels[0].marcher?.id;
      const marche = marches.find(m => m.id === marcheId);
      marcheName = marche ? marche.name : 'N/A';
    }
    
    console.log('marcheId:', materiels.length > 0 ? (materiels[0].marcheId || materiels[0].marcherId) : 'N/A');
    console.log('marcheName:', marcheName);
    
    // Afficher une notification
    setSuccess(`Génération d'un PDF avec ${materiels.length} décharge(s) pour le type ${typeName}...`);
    
    // Générer le contenu HTML pour toutes les décharges avec le nom du marché
    const allDechargesContent = generateMultipleDechargesContent(typeName, materiels, marcheName);
    
    // Ouvrir une seule fenêtre avec toutes les décharges
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(allDechargesContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé avant d'imprimer
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        
        // Fermer la fenêtre après l'impression ou l'annulation
        setTimeout(() => {
          printWindow.close();
        }, 3500);
      };
      
      // Fermer la fenêtre si l'utilisateur la ferme manuellement
      printWindow.addEventListener('beforeunload', () => {
        setTimeout(() => {
          printWindow.close();
        }, 100);
      });
      
      setSuccess(`PDF généré avec ${materiels.length} décharge(s) pour le type ${typeName} !`);
    } else {
      console.error('Impossible d\'ouvrir la fenêtre d\'impression');
      setError('Impossible de générer le PDF');
    }
  };

  const handlePrintAllDechargesForMarche = (marcheId, marcheName) => {
    console.log('Recherche de matériels pour le marché:', marcheId, marcheName);
    console.log('Tous les matériels:', materiels);
    
    // Utiliser la même logique que getLinkedCount
    const marcheMateriels = materiels.filter(mat =>
      mat?.marcherId === marcheId ||
      mat?.marcheId === marcheId ||
      mat?.marche?.id === marcheId ||
      mat?.marcher?.id === marcheId
    );
    
    console.log('Matériels trouvés:', marcheMateriels);
    
    if (marcheMateriels.length === 0) {
      setError(`Aucun matériel trouvé pour le marché ${marcheName} (ID: ${marcheId})`);
      return;
    }

    console.log(`Génération d'un PDF avec ${marcheMateriels.length} décharges pour le marché ${marcheName}`);
    setSuccess(`Génération d'un PDF avec ${marcheMateriels.length} décharge(s) pour le marché ${marcheName}...`);
    
    const allDechargesContent = generateMultipleDechargesContent('MARCHÉ', marcheMateriels, marcheName);
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(allDechargesContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé avant d'imprimer
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        
        // Fermer la fenêtre après l'impression ou l'annulation
        setTimeout(() => {
          printWindow.close();
        }, 3500);
      };
      
      // Fermer la fenêtre si l'utilisateur la ferme manuellement
      printWindow.addEventListener('beforeunload', () => {
        setTimeout(() => {
          printWindow.close();
        }, 100);
      });
      
      setSuccess(`PDF généré avec ${marcheMateriels.length} décharge(s) pour le marché ${marcheName} !`);
    } else {
      console.error('Impossible d\'ouvrir la fenêtre d\'impression');
      setError('Impossible de générer le PDF');
    }
  };

  const generateMultipleDechargesContent = (typeName, materiels, marcheName = null) => {
    // Générer le contenu de chaque décharge
    const dechargesHTML = materiels.map((materiel, index) => {
      const agent = agents.find(a => a.id === materiel.agentId);
      
      // Enrichir les données du matériel
      const enrichedMateriel = {
        ...materiel,
        type: {
          nom: materiel.type?.nom || materiel.typeNom || (types.find(t => t.id === materiel.typeMaterielId)?.nom) || 'N/A'
        },
        marque: {
          nom: materiel.marque?.nom || materiel.marqueNom || (marques.find(mk => mk.id === materiel.marqueId)?.nom) || 'N/A'
        },
        modele: {
          nom: materiel.modele?.nom || materiel.modeleNom || (modeles.find(md => md.id === materiel.modeleId)?.nom) || 'N/A'
        },
        marche: {
          name: materiel.marche?.name || materiel.marcheNom || 'N/A'
        }
      };
      
      return generateSingleDechargeHTML(enrichedMateriel, agent, index + 1);
    }).join('');
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Décharges de matériel informatique - ${typeName}${marcheName ? ` - MARCHÉ - ${marcheName}` : ''}</title>
  <style>
    @media print { 
      @page { size: A4; margin: 14mm; }
      .page-break { page-break-before: always; }
    }
    body { font-family: Arial, Helvetica, sans-serif; color: #000; }
    .decharge-container { margin-bottom: 40px; }
    .decharge-container:not(:last-child) { page-break-after: always; }
    .logo-wrap { display:flex; justify-content:center; margin-bottom: 20px; }
    .logo { height: 120px; width: 300px; }
    .city { text-align:right; margin-top: 6px; font-size: 13px; }
    h1 { text-align:center; text-decoration: underline; font-size: 20px; margin: 14px 0 18px; }
    .intro { text-align:center; font-size: 13px; margin-bottom: 10px; }
    table {
      margin: 0 auto;
      border-collapse: collapse;
      font-size: 14px;
      margin-top: 10px;
      margin-bottom: 12px;
      text-align:center
    }
    td {
      padding: 5px 15px;
      text-align: center;
    }
    td:first-child {
      font-weight: bold;
      text-align: right;
      text-align: center;
    }
    td:nth-child(2) {
      text-align: center;
      width: 10px;
    }
    td:last-child {
      text-align: left;
    }
    .commit { text-align:center; font-size: 13px; line-height: 1.5; margin: 16px 0 28px; }
    .sigrow { display:flex; justify-content: space-between; margin-top: 14px; }
    .sigbox { width: 45%; text-align:center; }
    .dotted { margin-top: 18px; border-top: 1px dotted #333; width: 75%; margin-left:auto; margin-right:auto; }
    .visa { text-align:center; margin-top: 60px; font-weight:700; }
  </style>
</head>
<body>
  ${dechargesHTML}
  <script>
    window.onload = function() {
      window.print();
      
      // Écouter l'événement d'annulation d'impression
      window.addEventListener('beforeunload', function() {
        // Fermer l'onglet si l'utilisateur annule l'impression
        setTimeout(() => {
          window.close();
        }, 100);
      });
      
      // Fermer automatiquement après un délai si l'impression se termine
      setTimeout(() => {
        window.close();
      }, 3500);
    };
    
    // Fermer l'onglet si l'utilisateur appuie sur Échap
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        window.close();
      }
    });
  </script>
</body>
</html>`;
  };

  const generateSingleDechargeHTML = (materiel, agent, dechargeNumber) => {
    const type = materiel.type?.nom || materiel.typeNom || '';
    const marque = materiel.marque?.nom || materiel.marqueNom || '';
    const modele = materiel.modele?.nom || materiel.modeleNom || '';
    const prettyDate = materiel.dateAffectation ? new Date(materiel.dateAffectation).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    
    // Créer le tableau avec 3 lignes (comme dans l'original)
    const mats = [
      { type, marque, modele, numeroSerie: materiel.numeroSerie },
      { type: '', marque: '', modele: '', numeroSerie: '' },
      { type: '', marque: '', modele: '', numeroSerie: '' },
    ];
    const col = (field) => mats.map(m => `<td >${m[field] || ''}</td>`).join('');
    
    const logoUrl = `${window.location.origin}/logo-andzoa.png`;
    
    return `
    <div class="decharge-container">
      <div class="logo-wrap"><img src="${logoUrl}" class="logo" /></div>
      </br>
      <div class="city"><span >............... </span> , le ${prettyDate}</div>  </br>
      </br>
      <h1>Décharge de matériel informatique</h1>
      </br>

      <div class="intro">Le(s) sous-signé(s) confirment réception du matériel suivant :</div>

      <table>
        <tr >
        <td >Désignation</td>
        <td >:</td>
        <td >${col('type')}</td>
        </tr>
        <tr ><td >Marque</td><td >:</td><td >${col('marque')}</td></tr>
        <tr ><td >Modèle</td><td >:</td><td >${col('modele')}</td></tr>
        <tr ><td >Numéro de Série</td><td >:</td><td >${col('numeroSerie')}</td></tr>
      </table>
      <div class="commit">
        Le(s) sous-signé(s) s'engagent à traiter le matériel avec soin, à veiller à ce qu'il soit déposé en un lieu sûr,
        et à le restituer dans son intégralité et dans l'état d'origine, sauf dans les cas de forces majeurs.
      </div>
      </br>
      </br>
      <div class="sigrow">
        <div class="sigbox">
          <div>Nom et Prénom du preneur</div>
          <div style="margin-top:10px;">........................................</div>
          <div style="margin-top:10px;">Signature</div>
        </div>
        
        </br>
        <div class="sigbox"><div>SOSI</div></div>
      </div>
        </br>
        </br>
        </br>
        </br>

      <div class="visa">VISA DAF</div>
    </div>`;
  };


  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [mRes, matRes, tRes, mkRes, mdRes, agRes] = await Promise.all([
        getMarches(),
        getMateriels(),
        getTypes(),
        getMarques(),
        getModeles(),
        getAgents()
      ]);
      setMarches(mRes.data || []);
      setMateriels(matRes.data || []);
      setTypes(tRes.data || []);
      setMarques(mkRes.data || []);
      setModeles(mdRes.data || []);
      setAgents(agRes.data || []);
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
      
      // Recharger les données
      await fetchAll();
      
      // Notifier les autres onglets de la mise à jour
      const customEventName = 'marches_updated';
      window.dispatchEvent(new CustomEvent(customEventName));
      
      // Mettre à jour le cache localStorage
      const updatedMarches = await getMarches();
      const dataWithTimestamp = {
        data: updatedMarches.data || [],
        timestamp: Date.now()
      };
      localStorage.setItem('marches_cache', JSON.stringify(dataWithTimestamp));
      
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de la création du marché");
    }
    setLoading(false);
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
      
      // Recharger les données
      await fetchAll();
      
      // Notifier les autres onglets de la mise à jour
      const customEventName = 'marches_updated';
      window.dispatchEvent(new CustomEvent(customEventName));
      
      // Mettre à jour le cache localStorage
      const updatedMarches = await getMarches();
      const dataWithTimestamp = {
        data: updatedMarches.data || [],
        timestamp: Date.now()
      };
      localStorage.setItem('marches_cache', JSON.stringify(dataWithTimestamp));
      
    } catch (e) {
      setError(e.response?.data?.message || "Suppression impossible. Vérifiez qu'aucun matériel n'est lié.");
    }
    setLoading(false);
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
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            size="small" 
                            startIcon={<PrintIcon />} 
                            onClick={() => handlePrintAllDechargesForMarche(m.id, m.name)}
                            disabled={loading}
                          >
                            Décharges
                          </Button>
                          <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(m.id)}>Supprimer</Button>
                        </Box>
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
                                      <Box sx={{ ml: 'auto', color: 'text.secondary', mr: 2 }}>{mats.length}</Box>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<PrintIcon />}
                                        onClick={() => handlePrintAllDechargesForType(typeName, mats)}
                                        color="primary"
                                        sx={{ fontSize: '0.75rem', py: 0.5 }}
                                      >
                                        Toutes les décharges {typeName}
                                      </Button>
                                    </Box>
                                    <Collapse in={open} timeout="auto" unmountOnExit>
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Numéro de série</TableCell>
                                            <TableCell>Marque</TableCell>
                                            <TableCell>Modèle</TableCell>
                                            <TableCell>Bénéficiaire</TableCell>
                                            <TableCell>Action</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {mats.map(mat => (
                                            <TableRow key={mat.id}>
                                              <TableCell>{mat.numeroSerie}</TableCell>
                                              <TableCell>{mat.marque?.nom || mat.marqueNom || (marques.find(mk => mk.id === mat.marqueId)?.nom)}</TableCell>
                                              <TableCell>{mat.modele?.nom || mat.modeleNom || (modeles.find(md => md.id === mat.modeleId)?.nom)}</TableCell>
                                              <TableCell>{(() => {
                                                const agent = agents.find(a => a.id === mat.agentId);
                                                return agent ? `${agent.nom} ${agent.username}` : '-';
                                              })()}</TableCell>
                                              <TableCell>
                                                <Button
                                                  variant="outlined"
                                                  size="small"
                                                  startIcon={<PrintIcon />}
                                                  onClick={() => handlePrintDechargeDirect(mat)}
                                                  color="primary"
                                                >
                                                  Décharge Matériel
                                                </Button>
                                              </TableCell>
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

      {/**
       * Hidden temporarily: selection of matériels to link during marché creation.
       * Uncomment this block to restore the inline selection UI.
       *
       * <Box sx={{ mt: 4 }}>
       *   <Box sx={{ mb: 1, fontWeight: 600 }}>Sélectionner des matériels à lier au marché en cours de création</Box>
       *   <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
       *     <Table>
       *       <TableHead sx={{ background: '#f4f6fa' }}>
       *         <TableRow>
       *           <TableCell padding="checkbox">
       *             <Checkbox
       *               checked={allVisibleSelected}
       *               indeterminate={!allVisibleSelected && someVisibleSelected}
       *               onChange={toggleSelectAllVisible}
       *             />
       *           </TableCell>
       *           <TableCell>Numéro de série</TableCell>
       *           <TableCell>Type</TableCell>
       *           <TableCell>Marque</TableCell>
       *           <TableCell>Modèle</TableCell>
       *         </TableRow>
       *       </TableHead>
       *       <TableBody>
       *         {unlinkedMateriels.slice(0, 10).map(mat => (
       *           <TableRow key={mat.id}>
       *             <TableCell padding="checkbox">
       *               <Checkbox checked={selectedMaterielIds.includes(mat.id)} onChange={() => toggleMateriel(mat.id)} />
       *             </TableCell>
       *             <TableCell>{mat.numeroSerie}</TableCell>
       *             <TableCell>{mat.type?.nom || mat.typeNom || (types.find(t => t.id === mat.typeMaterielId)?.nom)}</TableCell>
       *             <TableCell>{mat.marque?.nom || mat.marqueNom || (marques.find(mk => mk.id === mat.marqueId)?.nom)}</TableCell>
       *             <TableCell>{mat.modele?.nom || mat.modeleNom || (modeles.find(md => md.id === mat.modeleId)?.nom)}</TableCell>
       *           </TableRow>
       *         ))}
       *       </TableBody>
       *     </Table>
       *   </TableContainer>
       * </Box>
       */}
      
      {/* Dialogue d'impression de décharge */}
      <DechargePrint
        open={dechargeDialog.open}
        materiel={dechargeDialog.materiel}
        agent={dechargeDialog.agent}
        onClose={handleCloseDecharge}
      />
    </CardLayout>
  );
};

export default MarcheList;


