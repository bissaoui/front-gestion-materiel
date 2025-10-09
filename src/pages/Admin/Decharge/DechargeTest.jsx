import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import CardLayout from '../../../components/CardLayout';
import navTabs from '../../../components/adminNavTabs';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import logoAndzoa from '../../../assets/logo-andzoa.png';

const DechargeTest = () => {
  const location = useLocation();
  const [agent, setAgent] = useState('Agent Test');
  const [city, setCity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([
    { type: 'PC', marque: 'LENOVO', modele: 'T14S', numeroSerie: 'SN-001' },
    { type: '', marque: '', modele: '', numeroSerie: '' },
    { type: '', marque: '', modele: '', numeroSerie: '' },
  ]);

  const handleRowChange = (idx, field, value) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  

  const handlePrint = () => {
    const prettyDate = new Date(date).toLocaleDateString();
    const mats = rows.slice(0,3); // toujours 3 colonnes au max
    const col = (field) => mats.map(m => `<td class="cell">${m[field] || ''}</td>`).join('');
    const logoUrl = `${window.location.origin}${logoAndzoa.startsWith('/') ? '' : '/'}${logoAndzoa}`;
    const html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Décharge de matériel informatique</title>
        <style>
          @media print { @page { size: A4; margin: 14mm; } }
          body { font-family: Arial, Helvetica, sans-serif; color: #000; }
          .row { display:flex; align-items:center; justify-content:space-between; }
          .logo-wrap { display:flex; justify-content:center; }
          .logo { height: 110px; }
          .city { text-align:right; margin-top: 6px; font-size: 13px; }
          h1 { text-align:center; text-decoration: underline; font-size: 20px; margin: 14px 0 18px; }
          .intro { text-align:center; font-size: 13px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0 12px; }
          .label { width: 170px; font-weight: 700; }
          .sep { width: 8px; text-align:center; }
          .cell { width: calc((100% - 178px) / 3); text-align: left; padding-left: 6px; }
          .line { height: 10px; }
          .commit { text-align:center; font-size: 13px; line-height: 1.5; margin: 16px 0 28px; }
          .sigrow { display:flex; justify-content: space-between; margin-top: 14px; }
          .sigbox { width: 45%; text-align:center; }
          .dotted { margin-top: 18px; border-top: 1px dotted #333; width: 75%; margin-left:auto; margin-right:auto; }
          .visa { text-align:center; margin-top: 60px; font-weight:700; }
          .checkbox { display:inline-block; width:14px; height:14px; border:1px solid #333; margin: 0 6px; }
        </style>
      </head>
      <body>
        <div class="logo-wrap"><img src="${logoUrl}" class="logo" /></div>
        <div class="city">Ville, le ……………………</div>
        <h1>Décharge de matériel informatique</h1>
        <div class="intro">Le(s) sous-signé(s) confirment réception du matériel suivant :</div>
        <table>
          <tr class="line">
            <td class="label">Désignation</td><td class="sep">:</td>${col('type')}
          </tr>
          <tr class="line">
            <td class="label">Marque</td><td class="sep">:</td>${col('marque')}
          </tr>
          <tr class="line">
            <td class="label">Modèle</td><td class="sep">:</td>${col('modele')}
          </tr>
          <tr class="line">
            <td class="label">Numéro de Série</td><td class="sep">:</td>${col('numeroSerie')}
          </tr>
        </table>
        <div class="commit">
          Le(s) sous-signé(s) s’engagent à traiter le matériel avec soin, à veiller à ce qu’il soit déposé en un lieu sûr, et à le restituer dans son intégralité et dans l’état d’origine, sauf dans les cas de forces majeurs.
        </div>
        <div class="sigrow">
          <div class="sigbox">
            <div>Nom et Prénom du preneur</div>
            <div class="dotted"></div>
            <div style="margin-top:10px;">Signature</div>
          </div>
          <div class="sigbox">
            <div>${agent || 'SOSI'}</div>
          </div>
        </div>
        <div class="visa">VISA DAF</div>
        <script>window.onload = function(){ window.print(); setTimeout(()=>window.close(), 300); };</script>
      </body>
      </html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <CardLayout title="Test Décharge" navTabs={navTabs} currentPath={location.pathname}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle1">Paramètres</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Bénéficiaire" value={agent} onChange={e => setAgent(e.target.value)} size="small" /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Ville" value={city} onChange={e => setCity(e.target.value)} size="small" /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} size="small" /></Grid>
        </Grid>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Matériels (1 à 3)</Typography>
        {rows.map((r, idx) => (
          <Grid key={idx} container spacing={2}>
            <Grid item xs={12} sm={3}><TextField fullWidth label="Type" size="small" value={r.type} onChange={e => handleRowChange(idx, 'type', e.target.value)} /></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth label="Marque" size="small" value={r.marque} onChange={e => handleRowChange(idx, 'marque', e.target.value)} /></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth label="Modèle" size="small" value={r.modele} onChange={e => handleRowChange(idx, 'modele', e.target.value)} /></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth label="N° Série" size="small" value={r.numeroSerie} onChange={e => handleRowChange(idx, 'numeroSerie', e.target.value)} /></Grid>
          </Grid>
        ))}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => setRows(prev => [...prev, { type: '', marque: '', modele: '', numeroSerie: '' }].slice(0,3))}>+ Ligne</Button>
          <Button variant="contained" onClick={handlePrint}>Imprimer (test)</Button>
        </Box>
      </Box>
    </CardLayout>
  );
};

export default DechargeTest;


