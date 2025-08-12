import React, { useEffect, useState } from 'react';
import { getTypes, getMarques, getModeles, addMateriel } from '../../../api/materiel';
import { Link, useLocation } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import MaterielForm from '../../../components/MaterielForm';
import CardLayout from '../../../components/CardLayout';
import navTabs from '../../../components/adminNavTabs';
import { materielColumns } from '../../../components/adminTableColumns';


const AjouterMateriel = () => {
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [marques, setMarques] = useState([]);
  const [selectedMarque, setSelectedMarque] = useState('');
  const [modeles, setModeles] = useState([]);
  const [selectedModele, setSelectedModele] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();

  useEffect(() => {
    getTypes()
      .then(res => setTypes(res.data))
      .catch(() => setTypes([]));
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
    setSelectedModele('');
  }, [selectedType]);

  useEffect(() => {
    if (selectedMarque) {
      getModeles(selectedMarque)
        .then(res => setModeles(Array.isArray(res.data) ? res.data : []))
        .catch(() => setModeles([]));
    } else {
      setModeles([]);
      setSelectedModele('');
    }
  }, [selectedMarque]);

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
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de l'ajout du matériel.");
    }
    setLoading(false);
  };

  return (
    <CardLayout
      title="Ajouter un Matériel"
      navTabs={navTabs}
      currentPath={location.pathname}
    >
      <MaterielForm
        numeroSerie={numeroSerie}
        setNumeroSerie={setNumeroSerie}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedMarque={selectedMarque}
        setSelectedMarque={setSelectedMarque}
        selectedModele={selectedModele}
        setSelectedModele={setSelectedModele}
        types={types}
        marques={marques}
        modeles={modeles}
        loading={loading}
        error={error}
        success={success}
        onSubmit={handleSubmit}
        submitLabel="Ajouter le matériel"
      />
    </CardLayout>
  );
};

export default AjouterMateriel; 