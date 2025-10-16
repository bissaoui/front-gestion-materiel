import React, { useEffect, useState } from 'react';
import { getMarches, addMarche, updateMarche, deleteMarche } from '../../../api/marche';
import { getPrestataires } from '../../../api/prestataire';
import { getMateriels, updateMateriel, getTypes, getMarques, getModeles } from '../../../api/materiel';
import { getAgents } from '../../../api/agents';
import { useLocation, useNavigate } from 'react-router-dom';
import CardLayout from '../../../components/CardLayout';
import navTabs from '../../../components/adminNavTabs';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
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
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DechargePrint from '../../../components/DechargePrint';
import ExcelJS from 'exceljs';

const MarcheList = () => {
  const navigate = useNavigate();
  const [marches, setMarches] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [agents, setAgents] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [selectedMaterielIds, setSelectedMaterielIds] = useState([]);
  const today = new Date().toISOString().slice(0, 10);

  // Fonction pour formater les dates de manière cohérente
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return '-';
    }
  };
  const [newMarche, setNewMarche] = useState({ 
    name: '', 
    date: today,
    dateOrdreService: '',
    delaiExecution: '',
    dateReceptionProvisoire: '',
    dateReceptionDefinitive: '',
    typeMarche: 'UNIQUE',
    prestataireId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dateErrors, setDateErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({
    dateOrdreService: '',
    dateReceptionProvisoire: '',
    dateReceptionDefinitive: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const location = useLocation();
  const [openRows, setOpenRows] = useState({});
  const [openTypeRows, setOpenTypeRows] = useState({});
  const [dechargeDialog, setDechargeDialog] = useState({ open: false, materiel: null, agent: null });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMarche, setEditingMarche] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    date: '',
    dateOrdreService: '',
    delaiExecution: '',
    dateReceptionProvisoire: '',
    dateReceptionDefinitive: '',
    typeMarche: 'UNIQUE',
    prestataireId: ''
  });
  const [selectedMaterielsForEdit, setSelectedMaterielsForEdit] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' ou 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' ou 'desc'

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

  // Fonction pour obtenir les matériels non assignés à aucun marché
  const getUnassignedMateriels = () => {
    return materiels.filter(mat => 
      !mat?.marcherId && 
      !mat?.marcheId && 
      !mat?.marche?.id && 
      !mat?.marcher?.id
    );
  };

  const toggleRow = (id) => {
    setOpenRows(prev => {
      // Si la section est déjà ouverte, la fermer
      if (prev[id]) {
        return { ...prev, [id]: false };
      } else {
        // Sinon, fermer toutes les autres sections et ouvrir celle-ci
        return { [id]: true };
      }
    });
  };

  const groupLinkedByType = (marcheId) => {
    const list = getLinkedMateriels(marcheId);
    const byTypeAndMarque = {};
    const typeIdToName = Object.fromEntries(types.map(t => [t.id, t.nom]));
    const marqueIdToName = Object.fromEntries(marques.map(m => [m.id, m.nom]));
    
    list.forEach(mat => {
      const typeName = mat.type?.nom || mat.typeNom || typeIdToName[mat.typeMaterielId] || 'Type manquant';
      const marqueName = mat.marque?.nom || mat.marqueNom || marqueIdToName[mat.marqueId] || 'Marque manquante';
      
      // Créer une clé unique pour chaque combinaison type-marque
      const key = `${typeName} - ${marqueName}`;
      
      if (!byTypeAndMarque[key]) {
        byTypeAndMarque[key] = {
          type: typeName,
          marque: marqueName,
          materiels: []
        };
      }
      byTypeAndMarque[key].materiels.push(mat);
    });
    
    // Trier par type puis par marque
    const sortedKeys = Object.keys(byTypeAndMarque).sort((a, b) => {
      const [typeA, marqueA] = a.split(' - ');
      const [typeB, marqueB] = b.split(' - ');
      
      if (typeA !== typeB) return typeA.localeCompare(typeB);
      return marqueA.localeCompare(marqueB);
    });
    
    // Reconstruire l'objet trié
    const sortedResult = {};
    sortedKeys.forEach(key => {
      sortedResult[key] = byTypeAndMarque[key];
    });
    
    return sortedResult;
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

  const generateAssignmentProposalExcel = async (marcheName, materiels) => {
    // Fonction pour charger l'image en base64
    const loadImageAsBase64 = async (imageUrl) => {
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error('Image non trouvée');
        }
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // Enlever le préfixe data:image/png;base64,
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Erreur de chargement de l\'image:', error);
        return null;
      }
    };
    // Préparer les données avec toutes les informations
    const data = materiels.map(materiel => {
      const type = materiel.type?.nom || materiel.typeNom || (types.find(t => t.id === materiel.typeMaterielId)?.nom) || 'N/A';
      const marque = materiel.marque?.nom || materiel.marqueNom || (marques.find(mk => mk.id === materiel.marqueId)?.nom) || 'N/A';
      const modele = materiel.modele?.nom || materiel.modeleNom || (modeles.find(md => md.id === materiel.modeleId)?.nom) || 'N/A';
      const agent = agents.find(a => a.id === materiel.agentId);
      const agentName = agent ? `${agent.nom} ${agent.username}` : 'SOSI';
      const dateAffectation = agent ? (materiel.dateAffectation ? new Date(materiel.dateAffectation).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')) : '-';
      
      return {
        type,
        marque,
        modele,
        date: dateAffectation,
        agent: agentName,
        numeroSerie: materiel.numeroSerie || '-'
      };
    });

    // Trier par type, puis par marque, puis par modèle
    data.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      if (a.marque !== b.marque) return a.marque.localeCompare(b.marque);
      if (a.modele !== b.modele) return a.modele.localeCompare(b.modele);
      return 0;
    });

    // Grouper les données par type, marque et modèle (caractéristiques complètes)
    const groupedByCharacteristics = {};
    data.forEach(item => {
      const key = `${item.type}-${item.marque}-${item.modele}`;
      if (!groupedByCharacteristics[key]) {
        groupedByCharacteristics[key] = {
          type: item.type,
          marque: item.marque,
          modele: item.modele,
          items: []
        };
      }
      groupedByCharacteristics[key].items.push(item);
    });

    // Reconstruire les données en respectant la séparation par caractéristiques complètes
    const separatedData = [];
    Object.values(groupedByCharacteristics).forEach(group => {
      separatedData.push(...group.items);
    });

    // Créer un nouveau workbook avec ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Affectation");

    // Ajouter l'en-tête avec logo et informations
 

    // Ajouter le logo ANDZOA (vraie image)
    try {
      const logoBase64 = await loadImageAsBase64('/logoA.jpg');
      
      if (logoBase64) {
        const logoId = workbook.addImage({
          base64: logoBase64,
          extension: 'jpg',
        });
        
        worksheet.addImage(logoId, {
          tl: { col: 3, row:  0.3}, // Position top-left (colonne A, ligne 3)
          ext: { width: 350, height: 100 } // Taille du logo
        });
      } else {
        // Fallback: utiliser du texte si l'image ne charge pas
        worksheet.mergeCells('A3:F3');
        worksheet.getCell('A3').value = '🏢 ANDZOA';
        worksheet.getCell('A3').font = { 
          size: 24, 
          bold: true, 
          color: { argb: 'FF008000' },
          name: 'Arial'
        };
        worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du logo:', error);
      // Fallback: utiliser du texte
      worksheet.mergeCells('A3:F3');
      worksheet.getCell('A3').value = '🏢 ANDZOA';
      worksheet.getCell('A3').font = { 
        size: 24, 
        bold: true, 
        color: { argb: 'FF008000' },
        name: 'Arial'
      };
      worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
    }


    worksheet.mergeCells('C7:F7');
    worksheet.getCell('C7').value = `Objet : Acquisition de matériel de bureau`;
    worksheet.getCell('C7').font =  { size: 18, bold: true , name: "Arial Narrow"};
    worksheet.getCell('C7').alignment = { horizontal: 'center' };

    worksheet.mergeCells('C8:F8');
    worksheet.getCell('C8').value = `Marché : ${marcheName}`;
    worksheet.getCell('C8').font = { size: 18, bold: true , name: "Arial Narrow"};
    worksheet.getCell('C8').alignment = { horizontal: 'center'  };

    // Fusionner "Affectation" sur 4 lignes (9, 10, 11, 12)
    worksheet.mergeCells('C9:F12');
    worksheet.getCell('C9').value = 'Affectation';
    worksheet.getCell('C9').font = { size: 24, bold: true, name: "Agency FB" };
    worksheet.getCell('C9').alignment = { horizontal: 'center', vertical: 'middle' };

    // Ajouter l'en-tête du tableau (ligne 13) - de B à G
    worksheet.getRow(13).values = [
      '', // Colonne A vide
      'N° de prix', // Colonne B
      'Désignation', // Colonne C
      'Marque', // Colonne D
      'Modèle', // Colonne E
      'N° de série', // Colonne F
      'Affectation' // Colonne G
    ];

    // Ajouter les filtres automatiques au tableau complet
    // La plage sera mise à jour après l'ajout des données
    const lastRow = 13 + data.length;
    worksheet.autoFilter = {
      from: 'B13',
      to: `G${lastRow}`
    };

    // Style de l'en-tête du tableau (ligne 13) - colonnes B à G
    const headerRow = worksheet.getRow(13);
    headerRow.eachCell((cell, colNumber) => {
      // Appliquer le style orange aux colonnes B à G
      if (colNumber >= 2 && colNumber <= 7) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'E26B0A' } // Orange
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // Blanc
          bold: true,
          name: "Arial Narrow",
          size: 14
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      }

    });

    // Définir les colonnes du tableau
    worksheet.columns = [
      { header: '', key: 'empty', width: 7 }, // Colonne A vide
      { header: '', key: 'numeroPrix', width: 7 }, // Colonne B
      { header: '', key: 'designation', width: 71 }, // Colonne C
      { header: '', key: 'marque', width: 24 }, // Colonne D
      { header: '', key: 'modele', width: 43 }, // Colonne E
      { header: '', key: 'numeroSerie', width: 39 }, // Colonne F
      { header: '', key: 'affectation', width: 29 } // Colonne G
    ];

    // Ajouter les données (commence à la ligne 14, colonne B)
    let prixCounter = 1;
    let currentCharacteristicsForPrix = '';
    let isFirstRowOfGroup = true;
    
    separatedData.forEach((item, index) => {
      const rowNumber = 14 + index;
      const characteristics = `${item.type}-${item.marque}-${item.modele}`;
      
      // Incrémenter le numéro de prix quand les caractéristiques changent
      if (characteristics !== currentCharacteristicsForPrix) {
        if (currentCharacteristicsForPrix !== '') {
          prixCounter++;
        }
        currentCharacteristicsForPrix = characteristics;
        isFirstRowOfGroup = true;
      } else {
        isFirstRowOfGroup = false;
      }
      
      worksheet.getRow(rowNumber).values = [
        '', // Colonne A vide
        prixCounter, // Colonne B - N° de prix (séquentiel par caractéristiques)
        item.type, // Colonne C
        isFirstRowOfGroup ? item.marque : '', // Colonne D - Marque seulement dans la première ligne du groupe
        isFirstRowOfGroup ? item.modele : '', // Colonne E - Modèle seulement dans la première ligne du groupe
        item.numeroSerie, // Colonne F - N° de série dans chaque ligne
        item.agent // Colonne G - Affectation dans chaque ligne
      ];
    });

    // Style des cellules de données
    for (let i = 0; i < separatedData.length; i++) {
      const rowNumber = 14 + i;
      const row = worksheet.getRow(rowNumber);
      
      // Ajuster la hauteur des lignes à 30 pixels
      row.height = 30;
      row.eachCell((cell,colNumber) => {
        // Style pour les colonnes B à G
        if (colNumber >= 2 && colNumber <= 7) {
          if (colNumber === 3) {
            // Colonne C (Désignation) - Antique Olive Compact
            cell.alignment = {
              horizontal: 'center',
              vertical: 'middle'
            };
            cell.font = {
              size: 18,
              name: "Antique Olive Compact",
              bold: false
            };
          } else if (colNumber === 4 || colNumber === 5) {
            // Colonnes D (Marque) et E (Modèle) - Aptos ExtraBold
            cell.alignment = {
              horizontal: 'center',
              vertical: 'middle'
            };
            cell.font = {
              size: 18,
              name: "Aptos ExtraBold"
            };
          } else if (colNumber === 6) {
            // Colonne F (N° de série) - Times New Roman
            cell.alignment = {
              horizontal: 'left',
              vertical: 'bottom'
            };
            cell.font = {
              size: 12,
              bold: true,
              name: "Times New Roman",
              color: { argb: 'FF1F497D' }
            };
          } else if (colNumber === 7) {
            // Colonne G (Affectation) - Calibri
            cell.alignment = {
              horizontal: 'left',
              vertical: 'bottom'
            };
            cell.font = {
              size: 11,
              name: "Calibri"
            };
          } else {
            // Autres colonnes (B)
            cell.alignment = {
              horizontal: 'center',
              vertical: 'middle'
            };
            cell.font = {
              size: 18,
              name: "Arial Narrow"
            };
          }
          
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        }
      });
    }

    // Fusionner les cellules par caractéristiques complètes (type + marque + modèle)
    let currentCharacteristics = '';
    let groupStart = 14;
    let groupEnd = 14;

    for (let i = 0; i < separatedData.length; i++) {
      const currentRow = 14 + i;
      const item = separatedData[i];
      const characteristics = `${item.type}-${item.marque}-${item.modele}`;

      if (characteristics !== currentCharacteristics) {
        // Fusionner le groupe précédent s'il y en a un
        if (currentCharacteristics !== '' && groupEnd > groupStart) {
          worksheet.mergeCells(`B${groupStart}:B${groupEnd}`); // N° de prix
          worksheet.mergeCells(`C${groupStart}:C${groupEnd}`); // Désignation
          worksheet.mergeCells(`D${groupStart}:D${groupEnd}`); // Marque
          worksheet.mergeCells(`E${groupStart}:E${groupEnd}`); // Modèle
        }
        
        // Commencer un nouveau groupe
        currentCharacteristics = characteristics;
        groupStart = currentRow;
        groupEnd = currentRow;
      } else {
        // Mêmes caractéristiques, étendre la fin du groupe
        groupEnd = currentRow;
      }
    }

    // Fusionner le dernier groupe
    if (currentCharacteristics !== '' && groupEnd > groupStart) {
      worksheet.mergeCells(`B${groupStart}:B${groupEnd}`); // N° de prix
      worksheet.mergeCells(`C${groupStart}:C${groupEnd}`); // Désignation
      worksheet.mergeCells(`D${groupStart}:D${groupEnd}`); // Marque
      worksheet.mergeCells(`E${groupStart}:E${groupEnd}`); // Modèle
    }

    return workbook;
  };

  const handleDownloadAssignmentProposal = async (marcheId, marcheName) => {
    const marcheMateriels = getLinkedMateriels(marcheId);
    
    if (marcheMateriels.length === 0) {
      setError('Aucun matériel trouvé pour ce marché');
      return;
    }

    try {
      const workbook = await generateAssignmentProposalExcel(marcheName, marcheMateriels);
      
      // Générer le nom de fichier avec la date
      const date = new Date().toISOString().slice(0, 10);
      const fileName = `Proposition_affectation_${marcheName.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.xlsx`;
      
      // Générer le buffer et télécharger avec ExcelJS
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
      
      setSuccess(`Fichier Excel téléchargé : ${fileName}`);
    } catch (error) {
      console.error('Erreur lors de la génération du fichier Excel:', error);
      setError('Impossible de générer le fichier Excel');
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
    .logo { height: 120px; width: 330px; }
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
    
    const logoUrl = `${window.location.origin}/logoA.jpg`;
    
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
      const [mRes, matRes, tRes, mkRes, mdRes, agRes, pRes] = await Promise.all([
        getMarches(),
        getMateriels(),
        getTypes(),
        getMarques(),
        getModeles(),
        getAgents(),
        getPrestataires()
      ]);
      setMarches(mRes.data || []);
      setMateriels(matRes.data || []);
      setTypes(tRes.data || []);
      setMarques(mkRes.data || []);
      setModeles(mdRes.data || []);
      setAgents(agRes.data || []);
      setPrestataires(pRes.data || []);
      console.log('Prestataires chargés:', pRes.data);
      console.log('Marchés chargés:', mRes.data);
      console.log('Structure d\'un marché:', mRes.data?.[0]);
    } catch (e) {
      console.error('Erreur lors du chargement des prestataires:', e);
      setError(e.response?.data?.message || 'Erreur lors du chargement.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Réinitialiser la page quand le terme de recherche change
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  // Fonction pour basculer le tri par date
  const handleSortByDate = () => {
    if (sortBy === 'date') {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy('date');
      setSortOrder('desc');
    }
  };

  // Fonction pour basculer le tri par nom
  const handleSortByName = () => {
    if (sortBy === 'name') {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy('name');
      setSortOrder('asc');
    }
  };

  // Fonction pour vérifier si un nom de marché existe déjà
  const isMarcheNameExists = (name, excludeId = null) => {
    if (!name || !name.trim()) return false;
    return marches.some(m => 
      m.id !== excludeId && m.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  // Fonction pour valider les dates
  const validateDates = (formData) => {
    const errors = [];
    const fieldErrors = {
      dateOrdreService: '',
      dateReceptionProvisoire: '',
      dateReceptionDefinitive: ''
    };
    const creationDate = new Date(formData.date);
    
    if (formData.dateOrdreService) {
      const ordreServiceDate = new Date(formData.dateOrdreService);
      if (ordreServiceDate <= creationDate) {
        const errorMsg = 'La date ordre de service doit être postérieure à la date de création';
        errors.push(errorMsg);
        fieldErrors.dateOrdreService = errorMsg;
      }
    }
    
    if (formData.dateReceptionProvisoire) {
      const receptionProvisoireDate = new Date(formData.dateReceptionProvisoire);
      if (receptionProvisoireDate <= creationDate) {
        const errorMsg = 'La date réception provisoire doit être postérieure à la date de création';
        errors.push(errorMsg);
        fieldErrors.dateReceptionProvisoire = errorMsg;
      }
    }
    
    if (formData.dateReceptionDefinitive) {
      const receptionDefinitiveDate = new Date(formData.dateReceptionDefinitive);
      if (receptionDefinitiveDate <= creationDate) {
        const errorMsg = 'La date réception définitive doit être postérieure à la date de création';
        errors.push(errorMsg);
        fieldErrors.dateReceptionDefinitive = errorMsg;
      }
    }
    
    return { errors, fieldErrors };
  };

  // Fonction pour valider un champ spécifique en temps réel
  const validateField = (fieldName, value) => {
    if (!value || !newMarche.date) return '';
    
    const creationDate = new Date(newMarche.date);
    const fieldDate = new Date(value);
    
    if (fieldDate <= creationDate) {
      return `La date ${fieldName} doit être postérieure à la date de création`;
    }
    
    return '';
  };

  // Fonction pour vérifier si une date de réception doit être affichée en rouge
  const isReceptionDateUrgent = (receptionDate) => {
    if (!receptionDate) return false;
    
    const today = new Date();
    const reception = new Date(receptionDate);
    
    // Normaliser les dates (enlever les heures)
    today.setHours(0, 0, 0, 0);
    reception.setHours(0, 0, 0, 0);
    
    // Calculer la différence en jours
    const diffTime = reception.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Rouge si la date est passée ou si elle est dans les 2 prochains jours
    return diffDays <= 2;
  };

  // Fonction pour vérifier si une date de réception est passée (pour le clignotement)
  const isReceptionDatePassed = (receptionDate) => {
    if (!receptionDate) return false;
    
    const today = new Date();
    const reception = new Date(receptionDate);
    
    // Normaliser les dates (enlever les heures)
    today.setHours(0, 0, 0, 0);
    reception.setHours(0, 0, 0, 0);
    
    // Vérifier si la date est passée
    return reception < today;
  };

  // Fonction pour ouvrir le dialog d'édition
  const handleOpenEditDialog = (marche) => {
    setEditingMarche(marche);
    setEditFormData({
      name: marche.name || '',
      date: marche.date || '',
      dateOrdreService: marche.dateOrdreService || '',
      delaiExecution: marche.delaiExecution || '',
      dateReceptionProvisoire: marche.dateReceptionProvisoire || '',
      dateReceptionDefinitive: marche.dateReceptionDefinitive || '',
      typeMarche: marche.typeMarche || 'UNIQUE',
      prestataireId: marche.prestataire?.id || marche.prestataireId || ''
    });
    
    // Récupérer les matériels liés à ce marché
    const linkedMateriels = getLinkedMateriels(marche.id);
    setSelectedMaterielsForEdit(linkedMateriels.map(m => m.id));
    
    setEditDialogOpen(true);
  };

  // Fonction pour fermer le dialog d'édition
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingMarche(null);
    setEditFormData({
      name: '',
      date: '',
      dateOrdreService: '',
      delaiExecution: '',
      dateReceptionProvisoire: '',
      dateReceptionDefinitive: '',
      typeMarche: 'UNIQUE',
      prestataireId: ''
    });
    setSelectedMaterielsForEdit([]);
  };

  // Fonction pour gérer la modification d'un marché
  const handleUpdateMarche = async () => {
    setError('');
    setSuccess('');
    
    if (!editFormData.name.trim() || !editFormData.date) {
      setError('Le nom et la date sont obligatoires');
      return;
    }

    // Vérifier l'unicité du nom (en excluant le marché actuel)
    if (isMarcheNameExists(editFormData.name, editingMarche.id)) {
      setError(`Un marché avec le nom "${editFormData.name}" existe déjà. Veuillez choisir un nom différent.`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: editFormData.name.trim(),
        date: editFormData.date,
        dateOrdreService: editFormData.dateOrdreService || null,
        delaiExecution: editFormData.delaiExecution ? parseInt(editFormData.delaiExecution) : null,
        dateReceptionProvisoire: editFormData.dateReceptionProvisoire || null,
        dateReceptionDefinitive: editFormData.dateReceptionDefinitive || null,
        typeMarche: editFormData.typeMarche,
        prestataireId: editFormData.prestataireId || null
      };

      console.log('Payload de modification envoyé:', payload);
      await updateMarche(editingMarche.id, payload);

      // Mettre à jour les matériels liés
      const currentLinkedMateriels = getLinkedMateriels(editingMarche.id);
      const currentLinkedIds = currentLinkedMateriels.map(m => m.id);
      
      // Supprimer les matériels qui ne sont plus sélectionnés
      for (const materiel of currentLinkedMateriels) {
        if (!selectedMaterielsForEdit.includes(materiel.id)) {
          const updated = { ...materiel, marcherId: null, marcheId: null };
          delete updated.marcher;
          delete updated.marche;
          await updateMateriel(materiel.id, updated);
        }
      }

      // Ajouter les nouveaux matériels sélectionnés
      for (const materielId of selectedMaterielsForEdit) {
        if (!currentLinkedIds.includes(materielId)) {
          const materiel = materiels.find(m => m.id === materielId);
          if (materiel) {
            const updated = { ...materiel, marcherId: editingMarche.id, marcheId: editingMarche.id };
            delete updated.marcher;
            delete updated.marche;
            await updateMateriel(materielId, updated);
          }
        }
      }

      setSuccess('Marché modifié avec succès');
      handleCloseEditDialog();
      await fetchAll();
      
      // Notifier les autres onglets de la mise à jour
      const customEventName = 'marches_updated';
      window.dispatchEvent(new CustomEvent(customEventName));
      
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la modification du marché');
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDateErrors([]);
    
    if (!newMarche.name.trim() || !newMarche.date) return;
    
    // Valider les dates
    const { errors: dateValidationErrors, fieldErrors: newFieldErrors } = validateDates(newMarche);
    if (dateValidationErrors.length > 0) {
      setDateErrors(dateValidationErrors);
      setFieldErrors(newFieldErrors);
      return;
    }
    
    // Vérifier l'unicité du nom de marché
    const existingMarche = marches.find(m => 
      m.name.toLowerCase().trim() === newMarche.name.toLowerCase().trim()
    );
    
    if (existingMarche) {
      setError(`Un marché avec le nom "${newMarche.name}" existe déjà. Veuillez choisir un nom différent.`);
      return;
    }
    
    setLoading(true);
    try {
      const payload = { 
        name: newMarche.name.trim(), 
        date: newMarche.date,
        dateOrdreService: newMarche.dateOrdreService || null,
        delaiExecution: newMarche.delaiExecution ? parseInt(newMarche.delaiExecution) : null,
        dateReceptionProvisoire: newMarche.dateReceptionProvisoire || null,
        dateReceptionDefinitive: newMarche.dateReceptionDefinitive || null,
        typeMarche: newMarche.typeMarche,
        prestataireId: newMarche.prestataireId || null
      };
      console.log('Payload envoyé au backend:', payload);
      const res = await addMarche(payload);
      console.log('Réponse du backend:', res.data);
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
      setNewMarche({ 
        name: '', 
        date: today,
        dateOrdreService: '',
        delaiExecution: '',
        dateReceptionProvisoire: '',
        dateReceptionDefinitive: '',
        typeMarche: 'UNIQUE',
        prestataireId: ''
      });
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

  // Fonction pour gérer le clic sur un matériel non affecté
  const handleMaterielClick = (materiel) => {
    // Vérifier si le matériel n'est pas affecté (pas d'agentId)
    if (!materiel.agentId) {
      // Rediriger vers la page d'affectation avec l'ID du matériel
      navigate(`/affectations?materielId=${materiel.id}`);
    }
  };

  // Filtrer et trier les marchés
  const filteredAndSortedMarches = React.useMemo(() => {
    let filtered = marches;
    
    // Filtrer par nom de marché
    if (searchTerm.trim()) {
      filtered = marches.filter(marche => 
        marche.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Trier selon le critère et l'ordre sélectionnés
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (sortBy === 'name') {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (sortOrder === 'desc') {
          return nameB.localeCompare(nameA);
        } else {
          return nameA.localeCompare(nameB);
        }
      }
      return 0;
    });
  }, [marches, searchTerm, sortBy, sortOrder]);

  return (
    <CardLayout title="Gestion des Marchés" navTabs={navTabs} currentPath={location.pathname}>
      <Box component="form" onSubmit={handleCreate} sx={{ mb: 3, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
          Créer un nouveau marché
        </Typography>
        
        {/* Affichage des erreurs de validation des dates */}
        {dateErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Erreurs de validation des dates :
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {dateErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}
        
        {/* Informations principales */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          <TextField 
            label="Nom du marché" 
            value={newMarche.name} 
            onChange={e => setNewMarche({ ...newMarche, name: e.target.value })} 
            required 
            error={isMarcheNameExists(newMarche.name)}
            helperText={isMarcheNameExists(newMarche.name) ? "Ce nom existe déjà" : ""}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                bgcolor: 'white',
                borderRadius: 1
              }
            }}
          />
          <TextField 
            label="Date de création" 
            type="date" 
            value={newMarche.date} 
            onChange={e => {
              const value = e.target.value;
              setNewMarche({ ...newMarche, date: value });
              // Revalider tous les autres champs quand la date de création change
              const newFieldErrors = {
                dateOrdreService: validateField('ordre de service', newMarche.dateOrdreService),
                dateReceptionProvisoire: validateField('réception provisoire', newMarche.dateReceptionProvisoire),
                dateReceptionDefinitive: validateField('réception définitive', newMarche.dateReceptionDefinitive)
              };
              setFieldErrors(newFieldErrors);
            }} 
            required 
            InputLabelProps={{ shrink: true }}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                bgcolor: 'white',
                borderRadius: 1
              }
            }}
          />
          <TextField 
            select 
            label="Type de marché" 
            value={newMarche.typeMarche} 
            onChange={e => setNewMarche({ ...newMarche, typeMarche: e.target.value })}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                bgcolor: 'white',
                borderRadius: 1
              }
            }}
          >
            <MenuItem value="UNIQUE">Unique</MenuItem>
            <MenuItem value="RECONDUCTIBLE">Reconductible</MenuItem>
          </TextField>
          <TextField 
            select 
            label="Prestataire" 
            value={newMarche.prestataireId} 
            onChange={e => setNewMarche({ ...newMarche, prestataireId: e.target.value })}
            helperText={prestataires.length === 0 ? "Aucun prestataire" : `${prestataires.length} disponible(s)`}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                bgcolor: 'white',
                borderRadius: 1
              }
            }}
          >
            <MenuItem value="">Sélectionner</MenuItem>
            {prestataires.map(prestataire => (
              <MenuItem key={prestataire.id} value={prestataire.id}>
                {prestataire.raisonSocial}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        
        {/* Dates du projet */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          <TextField 
            label="Date ordre de service" 
            type="date" 
            value={newMarche.dateOrdreService} 
            onChange={e => {
              const value = e.target.value;
              setNewMarche({ ...newMarche, dateOrdreService: value });
              // Validation en temps réel
              const error = validateField('ordre de service', value);
              setFieldErrors(prev => ({ ...prev, dateOrdreService: error }));
              
              // Recalculer la date de réception provisoire si le délai est déjà saisi
              if (value && newMarche.delaiExecution) {
                const ordreServiceDate = new Date(value);
                const receptionProvisoireDate = new Date(ordreServiceDate);
                receptionProvisoireDate.setDate(ordreServiceDate.getDate() + parseInt(newMarche.delaiExecution));
                
                const formattedDate = receptionProvisoireDate.toISOString().split('T')[0];
                setNewMarche(prev => ({ 
                  ...prev, 
                  dateOrdreService: value,
                  dateReceptionProvisoire: formattedDate
                }));
                
                // Revalider le champ réception provisoire
                const receptionError = validateField('réception provisoire', formattedDate);
                setFieldErrors(prev => ({ ...prev, dateReceptionProvisoire: receptionError }));
              }
            }}
            InputLabelProps={{ shrink: true }}
            error={!!fieldErrors.dateOrdreService}
            helperText={fieldErrors.dateOrdreService}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                bgcolor: 'white',
                borderRadius: 1
              }
            }}
          />
          <TextField 
            label="Délai d'exécution (jours)" 
            type="number" 
            value={newMarche.delaiExecution} 
            onChange={e => {
              const delai = e.target.value;
              setNewMarche({ ...newMarche, delaiExecution: delai });
              
              // Calculer automatiquement la date de réception provisoire
              if (delai && newMarche.dateOrdreService) {
                const ordreServiceDate = new Date(newMarche.dateOrdreService);
                const receptionProvisoireDate = new Date(ordreServiceDate);
                receptionProvisoireDate.setDate(ordreServiceDate.getDate() + parseInt(delai));
                
                const formattedDate = receptionProvisoireDate.toISOString().split('T')[0];
                setNewMarche(prev => ({ 
                  ...prev, 
                  delaiExecution: delai,
                  dateReceptionProvisoire: formattedDate
                }));
                
                // Revalider le champ réception provisoire
                const error = validateField('réception provisoire', formattedDate);
                setFieldErrors(prev => ({ ...prev, dateReceptionProvisoire: error }));
              }
            }}
            inputProps={{ min: 0 }}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                bgcolor: 'white',
                borderRadius: 1
              }
            }}
          />
          <TextField 
            label="Date réception provisoire" 
            type="date" 
            value={newMarche.dateReceptionProvisoire} 
            onChange={e => {
              const value = e.target.value;
              setNewMarche({ ...newMarche, dateReceptionProvisoire: value });
              // Validation en temps réel
              const error = validateField('réception provisoire', value);
              setFieldErrors(prev => ({ ...prev, dateReceptionProvisoire: error }));
            }}
            InputLabelProps={{ shrink: true }}
            error={!!fieldErrors.dateReceptionProvisoire}
            helperText={fieldErrors.dateReceptionProvisoire}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                bgcolor: 'white',
                borderRadius: 1
              }
            }}
          />
          <TextField 
            label="Date réception définitive" 
            type="date" 
            value={newMarche.dateReceptionDefinitive} 
            onChange={e => {
              const value = e.target.value;
              setNewMarche({ ...newMarche, dateReceptionDefinitive: value });
              // Validation en temps réel
              const error = validateField('réception définitive', value);
              setFieldErrors(prev => ({ ...prev, dateReceptionDefinitive: error }));
            }}
            InputLabelProps={{ shrink: true }}
            error={!!fieldErrors.dateReceptionDefinitive}
            helperText={fieldErrors.dateReceptionDefinitive}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                bgcolor: 'white',
                borderRadius: 1
              }
            }}
          />
        </Box>
        
        {/* Bouton d'ajout */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={<AddIcon />} 
            disabled={loading || isMarcheNameExists(newMarche.name) || !newMarche.name.trim() || 
              Object.values(fieldErrors).some(error => error !== '')}
            sx={{ 
              minWidth: 200,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Créer le marché'}
          </Button>
        </Box>
      </Box>
      
      {/* Filtre de recherche */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField 
          label="Rechercher par nom de marché" 
          size="small" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ minWidth: 300 }}
          placeholder="Ex: M01/2025/ANDZOA"
        />
        {searchTerm && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setSearchTerm('')}
            sx={{ minWidth: 100 }}
          >
            Effacer
          </Button>
        )}
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
                <TableCell 
                  onClick={handleSortByName}
                  sx={{ 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    '&:hover': { 
                      backgroundColor: '#e3f2fd',
                      '& .sort-icon': {
                        opacity: 1
                      }
                    },
                    position: 'relative',
                    paddingRight: '32px'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>Marché</span>
                    <Box 
                      className="sort-icon"
                      sx={{ 
                        opacity: sortBy === 'name' ? 1 : 0.3,
                        transition: 'opacity 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    >
                      {sortBy === 'name' ? (
                        sortOrder === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />
                      ) : (
                        <ArrowDownwardIcon fontSize="small" sx={{ opacity: 0.3 }} />
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={handleSortByDate}
                  sx={{ 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    '&:hover': { 
                      backgroundColor: '#e3f2fd',
                      '& .sort-icon': {
                        opacity: 1
                      }
                    },
                    position: 'relative',
                    paddingRight: '32px'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>Date</span>
                    <Box 
                      className="sort-icon"
                      sx={{ 
                        opacity: sortBy === 'date' ? 1 : 0.3,
                        transition: 'opacity 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    >
                      {sortBy === 'date' ? (
                        sortOrder === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />
                      ) : (
                        <ArrowDownwardIcon fontSize="small" sx={{ opacity: 0.3 }} />
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>Matériels liés</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedMarches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary' }}>
                    {searchTerm ? 'Aucun marché trouvé pour cette recherche.' : 'Aucun marché trouvé.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedMarches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(m => (
                  <React.Fragment key={m.id}>
                    <TableRow hover>
                      <TableCell padding="checkbox">
                        <IconButton size="small" onClick={() => toggleRow(m.id)} aria-label="expand row">
                          {openRows[m.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{m.id}</TableCell>
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{formatDate(m.date)}</TableCell>
                      <TableCell>{getLinkedCount(m.id)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button 
                            variant="outlined" 
                            color="info" 
                            size="small" 
                            startIcon={<EditIcon />} 
                            onClick={() => handleOpenEditDialog(m)}
                            disabled={loading}
                          >
                            Modifier
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="success" 
                            size="small" 
                            startIcon={<DownloadIcon />} 
                            onClick={() => handleDownloadAssignmentProposal(m.id, m.name)}
                            disabled={loading}
                          >
                            Proposition
                          </Button>
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
                            {/* Section d'informations supplémentaires */}
                            <Box sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: 1, p: 2, bgcolor: '#fafafa' }}>
                              <Box sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Informations du marché</Box>
                    <Box sx={{ pl: 4, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                      <Box>
                        <Box sx={{ fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>Référence marché</Box>
                        <Box sx={{ fontSize: '0.95rem' }}>{m.name}</Box>
                      </Box>
                      <Box>
                        <Box sx={{ fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>Date de création</Box>
                        <Box sx={{ fontSize: '0.95rem' }}>{formatDate(m.date)}</Box>
                      </Box>
                      <Box>
                        <Box sx={{ fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>Type de marché</Box>
                        <Box sx={{ fontSize: '0.95rem' }}>
                          <Box component="span" sx={{ 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1, 
                            bgcolor: m.typeMarche === 'UNIQUE' ? '#e3f2fd' : '#f3e5f5', 
                            color: m.typeMarche === 'UNIQUE' ? '#1976d2' : '#7b1fa2',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}>
                            {m.typeMarche === 'UNIQUE' ? 'Unique' : 'Reconductible'}
                          </Box>
                        </Box>
                      </Box>
                      <Box>
                        <Box sx={{ fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>Prestataire</Box>
                        <Box sx={{ fontSize: '0.95rem' }}>
                          {m.prestataire?.raisonSocial || (m.prestataireId ? prestataires.find(p => p.id === m.prestataireId)?.raisonSocial : null) || 'Non assigné'}
                        </Box>
                      </Box>
                      <Box>
                        <Box sx={{ fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>Date ordre de service</Box>
                        <Box sx={{ fontSize: '0.95rem' }}>
                          {formatDate(m.dateOrdreService)}
                        </Box>
                      </Box>
                      <Box>
                        <Box sx={{ fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>Délai d'exécution</Box>
                        <Box sx={{ fontSize: '0.95rem' }}>
                          {m.delaiExecution ? `${m.delaiExecution} jour(s)` : '-'}
                        </Box>
                      </Box>
                      <Box>
                        <Box sx={{ fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>Réception provisoire</Box>
                        <Box sx={{ 
                          fontSize: '0.95rem',
                          color: isReceptionDatePassed(m.dateReceptionProvisoire) ? '#d32f2f' : 
                                 isReceptionDateUrgent(m.dateReceptionProvisoire) ? '#ff9800' : 'inherit',
                          fontWeight: (isReceptionDateUrgent(m.dateReceptionProvisoire) || isReceptionDatePassed(m.dateReceptionProvisoire)) ? 600 : 'normal',
                          ...(isReceptionDatePassed(m.dateReceptionProvisoire) && {
                            animation: 'blink 1s infinite',
                            '@keyframes blink': {
                              '0%': { opacity: 1 },
                              '50%': { opacity: 0.3 },
                              '100%': { opacity: 1 }
                            }
                          })
                        }}>
                          {formatDate(m.dateReceptionProvisoire)}
                          {isReceptionDatePassed(m.dateReceptionProvisoire) && (
                            <Box component="span" sx={{ ml: 1, fontSize: '0.8rem', fontStyle: 'italic' }}>
                              (dépassé le délai d'exécution)
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Box>
                        <Box sx={{ fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>Réception définitive</Box>
                        <Box sx={{ 
                          fontSize: '0.95rem',
                          color: isReceptionDatePassed(m.dateReceptionDefinitive) ? '#d32f2f' : 
                                 isReceptionDateUrgent(m.dateReceptionDefinitive) ? '#ff9800' : 'inherit',
                          fontWeight: (isReceptionDateUrgent(m.dateReceptionDefinitive) || isReceptionDatePassed(m.dateReceptionDefinitive)) ? 600 : 'normal',
                          ...(isReceptionDatePassed(m.dateReceptionDefinitive) && {
                            animation: 'blink 1s infinite',
                            '@keyframes blink': {
                              '0%': { opacity: 1 },
                              '50%': { opacity: 0.3 },
                              '100%': { opacity: 1 }
                            }
                          })
                        }}>
                          {formatDate(m.dateReceptionDefinitive)}
                          {isReceptionDatePassed(m.dateReceptionDefinitive) && (
                            <Box component="span" sx={{ ml: 1, fontSize: '0.8rem', fontStyle: 'italic' }}>
                              (dépassé le délai d'exécution)
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Box>
                        <Box sx={{ fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>Nombre total de matériels</Box>
                        <Box sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#1976d2' }}>{getLinkedCount(m.id)}</Box>
                      </Box>
                      <Box>
                        <Box sx={{ fontWeight: 500, color: '#666', fontSize: '0.875rem' }}>Types de matériels</Box>
                        <Box sx={{ fontSize: '0.95rem' }}>
                          {Object.keys(groupLinkedByType(m.id)).length} type(s)
                        </Box>
                      </Box>
                    </Box>
                            </Box>

                            {Object.entries(groupLinkedByType(m.id)).length === 0 ? (
                              <Box sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>Aucun matériel lié.</Box>
                            ) : (
                              Object.entries(groupLinkedByType(m.id)).map(([typeMarqueKey, groupData]) => {
                                const key = `${m.id}:${typeMarqueKey}`;
                                const open = !!openTypeRows[key];
                                const { type, marque, materiels } = groupData;
                                return (
                                  <Box key={key} sx={{ mb: 1, border: '1px solid #eee', borderRadius: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, bgcolor: '#f9fafb' }}>
                                      <IconButton size="small" onClick={() => toggleTypeRow(m.id, typeMarqueKey)}>
                                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                      </IconButton>
                                      <Box sx={{ fontWeight: 600 }}>
                                        <Box component="span" sx={{ color: '#1976d2' }}>{type}</Box>
                                        <Box component="span" sx={{ mx: 1, color: '#666' }}>-</Box>
                                        <Box component="span" sx={{ color: '#d32f2f' }}>{marque}</Box>
                                      </Box>
                                      <Box sx={{ ml: 'auto', color: 'text.secondary', mr: 2 }}>{materiels.length}</Box>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<PrintIcon />}
                                        onClick={() => handlePrintAllDechargesForType(`${type} - ${marque}`, materiels)}
                                        color="primary"
                                        sx={{ 
                                          fontSize: '0.75rem', 
                                          py: 0.5,
                                          width: 250,
                                          textAlign: 'left'
                                        }}
                                      >
                                        Décharges {type} - {marque}
                                      </Button>
                                    </Box>
                                    <Collapse in={open} timeout="auto" unmountOnExit>
                                      <Table size="small" sx={{ tableLayout: 'fixed' }}>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell sx={{ width: '18%' }}>Numéro de série</TableCell>
                                            <TableCell sx={{ width: '12%' }}>Marque</TableCell>
                                            <TableCell sx={{ width: '22%' }}>Modèle</TableCell>
                                            <TableCell sx={{ width: '23%' }}>Bénéficiaire</TableCell>
                                            <TableCell sx={{ width: '25%' }}>Action</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {materiels.map(mat => (
                                            <TableRow key={mat.id}>
                                              <TableCell sx={{ width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat.numeroSerie || 'Non renseigné'}</TableCell>
                                              <TableCell sx={{ width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat.marque?.nom || mat.marqueNom || (marques.find(mk => mk.id === mat.marqueId)?.nom) || 'Marque manquante'}</TableCell>
                                              <TableCell sx={{ width: '22%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat.modele?.nom || mat.modeleNom || (modeles.find(md => md.id === mat.modeleId)?.nom) || 'Modèle manquant'}</TableCell>
                                              <TableCell 
                                                onClick={() => handleMaterielClick(mat)}
                                                sx={{ 
                                                  width: '23%',
                                                  overflow: 'hidden', 
                                                  textOverflow: 'ellipsis', 
                                                  whiteSpace: 'nowrap',
                                                  cursor: !mat.agentId ? 'pointer' : 'default',
                                                  color: !mat.agentId ? '#1976d2' : 'inherit',
                                                  textDecoration: !mat.agentId ? 'underline' : 'none'
                                                }}
                                                title={!mat.agentId ? 'Cliquer pour affecter ce matériel' : ''}
                                              >
                                                {(() => {
                                                  const agent = agents.find(a => a.id === mat.agentId);
                                                  return agent ? `${agent.nom} ${agent.username}` : '-';
                                                })()}
                                              </TableCell>
                                              <TableCell sx={{ width: '25%' }}>
                                                <Button
                                                  variant="outlined"
                                                  size="small"
                                                  startIcon={<PrintIcon />}
                                                  onClick={() => handlePrintDechargeDirect(mat)}
                                                  color="primary"
                                                  sx={{ whiteSpace: 'nowrap' }}
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
          <TablePagination component="div" count={filteredAndSortedMarches.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5,10,20,50]} labelRowsPerPage="Lignes par page" />
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

      {/* Dialogue de modification de marché */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
          color: 'white', 
          fontSize: '1.5rem', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <EditIcon />
          Modifier le marché
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
  

            {/* Section Configuration */}
            <Box sx={{ 
              p: 3, 
              mt:4,
              border: '1px solid #e0e0e0', 
              borderRadius: 2, 
              bgcolor: '#fafafa',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                ⚙️ Informations du marché : {editFormData.name}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                  label="Nom du marché"
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  error={isMarcheNameExists(editFormData.name, editingMarche?.id)}
                  helperText={isMarcheNameExists(editFormData.name, editingMarche?.id) ? "Ce nom de marché existe déjà" : ""}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
                <TextField
                  label="Date de création"
                  type="date"
                  value={editFormData.date}
                  onChange={e => setEditFormData({ ...editFormData, date: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
                <TextField
                  select
                  label="Type de marché"
                  value={editFormData.typeMarche}
                  onChange={e => setEditFormData({ ...editFormData, typeMarche: e.target.value })}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                >
                  <MenuItem value="UNIQUE">Unique</MenuItem>
                  <MenuItem value="RECONDUCTIBLE">Reconductible</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Prestataire"
                  value={editFormData.prestataireId}
                  onChange={e => setEditFormData({ ...editFormData, prestataireId: e.target.value })}
                  helperText={prestataires.length === 0 ? "Aucun prestataire disponible" : `${prestataires.length} prestataire(s) disponible(s)`}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                >
                  <MenuItem value="">Sélectionner un prestataire</MenuItem>
                  {prestataires.map(prestataire => (
                    <MenuItem key={prestataire.id} value={prestataire.id}>
                      {prestataire.raisonSocial}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Date ordre de service"
                  type="date"
                  value={editFormData.dateOrdreService}
                  onChange={e => {
                    const value = e.target.value;
                    setEditFormData({ ...editFormData, dateOrdreService: value });
                    
                    // Recalculer la date de réception provisoire si le délai est déjà saisi
                    if (value && editFormData.delaiExecution) {
                      const ordreServiceDate = new Date(value);
                      const receptionProvisoireDate = new Date(ordreServiceDate);
                      receptionProvisoireDate.setDate(ordreServiceDate.getDate() + parseInt(editFormData.delaiExecution));
                      
                      const formattedDate = receptionProvisoireDate.toISOString().split('T')[0];
                      setEditFormData(prev => ({ 
                        ...prev, 
                        dateOrdreService: value,
                        dateReceptionProvisoire: formattedDate
                      }));
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
                <TextField
                  label="Délai d'exécution (jours)"
                  type="number"
                  value={editFormData.delaiExecution}
                  onChange={e => {
                    const delai = e.target.value;
                    setEditFormData({ ...editFormData, delaiExecution: delai });
                    
                    // Calculer automatiquement la date de réception provisoire
                    if (delai && editFormData.dateOrdreService) {
                      const ordreServiceDate = new Date(editFormData.dateOrdreService);
                      const receptionProvisoireDate = new Date(ordreServiceDate);
                      receptionProvisoireDate.setDate(ordreServiceDate.getDate() + parseInt(delai));
                      
                      const formattedDate = receptionProvisoireDate.toISOString().split('T')[0];
                      setEditFormData(prev => ({ 
                        ...prev, 
                        delaiExecution: delai,
                        dateReceptionProvisoire: formattedDate
                      }));
                    }
                  }}
                  inputProps={{ min: 0 }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
                <TextField
                  label="Date réception provisoire"
                  type="date"
                  value={editFormData.dateReceptionProvisoire}
                  onChange={e => setEditFormData({ ...editFormData, dateReceptionProvisoire: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
                <TextField
                  label="Date réception définitive"
                  type="date"
                  value={editFormData.dateReceptionDefinitive}
                  onChange={e => setEditFormData({ ...editFormData, dateReceptionDefinitive: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      bgcolor: 'white'
                    }
                  }}
                />
              </Box>
            </Box>


            {/* Section Gestion des matériels */}
            <Box sx={{ 
              p: 3, 
              border: '1px solid #e0e0e0', 
              borderRadius: 2, 
              bgcolor: '#fafafa',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                📦 Gestion des matériels
              </Typography>
              
              {/* Matériels actuellement liés */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 2, 
                  p: 2, 
                  bgcolor: '#e3f2fd', 
                  borderRadius: 2,
                  border: '1px solid #bbdefb'
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                    Matériels actuellement liés
                  </Typography>
                  <Box sx={{ 
                    px: 1.5, 
                    py: 0.5, 
                    bgcolor: '#1976d2', 
                    color: 'white', 
                    borderRadius: 1, 
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {getLinkedMateriels(editingMarche?.id).length}
                  </Box>
                </Box>
                <Box sx={{ 
                  maxHeight: 250, 
                  overflow: 'auto', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 2, 
                  p: 2, 
                  bgcolor: 'white',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {getLinkedMateriels(editingMarche?.id).length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <Typography variant="body2">Aucun matériel lié à ce marché</Typography>
                    </Box>
                  ) : (
                    getLinkedMateriels(editingMarche?.id).map(materiel => (
                      <Box key={materiel.id} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2, 
                        p: 2, 
                        bgcolor: '#f8f9fa', 
                        borderRadius: 2, 
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#e3f2fd',
                          borderColor: '#1976d2'
                        }
                      }}>
                        <Checkbox
                          checked={selectedMaterielsForEdit.includes(materiel.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedMaterielsForEdit([...selectedMaterielsForEdit, materiel.id]);
                            } else {
                              setSelectedMaterielsForEdit(selectedMaterielsForEdit.filter(id => id !== materiel.id));
                            }
                          }}
                          sx={{ color: '#1976d2' }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {materiel.type?.nom || materiel.typeNom || types.find(t => t.id === materiel.typeMaterielId)?.nom || 'Type manquant'} - {materiel.marque?.nom || materiel.marqueNom || marques.find(m => m.id === materiel.marqueId)?.nom || 'Marque manquante'} - {materiel.modele?.nom || materiel.modeleNom || modeles.find(m => m.id === materiel.modeleId)?.nom || 'Modèle manquant'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            N° de série: {materiel.numeroSerie || 'Non renseigné'} | Agent: {materiel.agent?.nom || materiel.agentNom || (materiel.agentId ? agents.find(a => a.id === materiel.agentId)?.nom : null) || 'Non affecté'}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>

              {/* Matériels disponibles */}
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 2, 
                  p: 2, 
                  bgcolor: '#f3e5f5', 
                  borderRadius: 2,
                  border: '1px solid #e1bee7'
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
                    Matériels disponibles
                  </Typography>
                  <Box sx={{ 
                    px: 1.5, 
                    py: 0.5, 
                    bgcolor: '#7b1fa2', 
                    color: 'white', 
                    borderRadius: 1, 
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {getUnassignedMateriels().length}
                  </Box>
                </Box>
                <Box sx={{ 
                  maxHeight: 250, 
                  overflow: 'auto', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 2, 
                  p: 2, 
                  bgcolor: 'white',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {getUnassignedMateriels().length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <Typography variant="body2">Tous les matériels sont assignés à des marchés</Typography>
                    </Box>
                  ) : (
                    getUnassignedMateriels().map(materiel => (
                      <Box key={materiel.id} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2, 
                        p: 2, 
                        bgcolor: '#fafafa', 
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#f3e5f5',
                          borderColor: '#7b1fa2'
                        }
                      }}>
                        <Checkbox
                          checked={selectedMaterielsForEdit.includes(materiel.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedMaterielsForEdit([...selectedMaterielsForEdit, materiel.id]);
                            } else {
                              setSelectedMaterielsForEdit(selectedMaterielsForEdit.filter(id => id !== materiel.id));
                            }
                          }}
                          sx={{ color: '#7b1fa2' }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {materiel.type?.nom || materiel.typeNom || types.find(t => t.id === materiel.typeMaterielId)?.nom || 'Type manquant'} - {materiel.marque?.nom || materiel.marqueNom || marques.find(m => m.id === materiel.marqueId)?.nom || 'Marque manquante'} - {materiel.modele?.nom || materiel.modeleNom || modeles.find(m => m.id === materiel.modeleId)?.nom || 'Modèle manquant'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            N° de série: {materiel.numeroSerie || 'Non renseigné'} | Agent: {materiel.agent?.nom || materiel.agentNom || (materiel.agentId ? agents.find(a => a.id === materiel.agentId)?.nom : null) || 'Non affecté'}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>

            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          bgcolor: '#f5f5f5', 
          borderTop: '1px solid #e0e0e0',
          gap: 2
        }}>
          <Button 
            onClick={handleCloseEditDialog} 
            disabled={loading}
            variant="outlined"
            sx={{ 
              minWidth: 120,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleUpdateMarche} 
            variant="contained" 
            disabled={loading || isMarcheNameExists(editFormData.name, editingMarche?.id) || !editFormData.name.trim()}
            sx={{ 
              minWidth: 120,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              }
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Modifier'}
          </Button>
        </DialogActions>
      </Dialog>
    </CardLayout>
  );
};

export default MarcheList;


