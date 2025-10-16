import React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Divider } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

const DechargePrint = ({ materiel, agent, onClose, open }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent(materiel, agent);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const generatePrintContent = (materiel, agent) => {
    // Récupérer les données du matériel
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
    
    // URL du logo (utiliser le logo ANDZOA)
    const logoUrl = `${window.location.origin}/logoA.jpg`;
    
    return `<!DOCTYPE html>
      <html>
<head>
  <meta charset="utf-8" />
  <title>Décharge de matériel informatique</title>
  <style>
    @media print { @page { size: A4; margin: 14mm; } }
    body { font-family: Arial, Helvetica, sans-serif; color: #000; }
    .logo-wrap { display:flex; justify-content:center; margin-bottom: 20px; }
    .logo { height: 120px; }
.city { text-align:right; margin-top: 6px; font-size: 13px; }
    h1 { text-align:center; text-decoration: underline; font-size: 20px; margin: 14px 0 18px; }
    .intro { text-align:center; font-size: 13px; margin-bottom: 10px; }
    /* Table centered */
    table {
      margin: 0 auto; /* center horizontally */
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
  <div class="logo-wrap"><img src="${logoUrl}" class="logo" /></div>
</br>
<div class="city"><span >.......ds........ </span> , le ${prettyDate}</div>  </br>
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

  <script>
    window.onload = function() {
      window.print();
      setTimeout(()=>window.close(), 300);
    };
  </script>
</body>
</html>`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PrintIcon color="primary" />
          Décharge de Matériel
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Matériel: {materiel?.numeroSerie}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Type: {materiel?.type?.nom || materiel?.typeNom || 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Marque: {materiel?.marque?.nom || materiel?.marqueNom || 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Modèle: {materiel?.modele?.nom || materiel?.modeleNom || 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Bénéficiaire: {agent ? `${agent.nom} ${agent.username}` : 'N/A'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2">
            Cliquez sur "Imprimer" pour générer la décharge complète avec toutes les informations.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Annuler
        </Button>
        <Button onClick={handlePrint} variant="contained" startIcon={<PrintIcon />}>
          Imprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DechargePrint;
