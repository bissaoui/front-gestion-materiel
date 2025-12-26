import React, { useEffect, useState } from 'react';
import { addMateriel } from '../../../api/materiel';
import { useLocation } from 'react-router-dom';
import MaterielForm from '../../../components/MaterielForm';
import CardLayout from '../../../components/CardLayout';
import navTabs from '../../../components/adminNavTabs';
import { useMarchesSync, useTypesSync, useMarquesSync, useModelesSync } from '../../../hooks/useDataSync';


const AjouterMateriel = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedMarque, setSelectedMarque] = useState('');
  const [selectedModele, setSelectedModele] = useState('');
  const [selectedMarche, setSelectedMarche] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();

  // Utilisation des hooks de synchronisation
  const { data: types, loading: typesLoading, error: typesError } = useTypesSync();
  const { data: marches, loading: marchesLoading, error: marchesError } = useMarchesSync();
  const { data: marques, loading: marquesLoading, error: marquesError } = useMarquesSync(selectedType);
  const { data: modeles, loading: modelesLoading, error: modelesError } = useModelesSync(selectedMarque, selectedType);

  // Réinitialiser les sélections quand le type change
  useEffect(() => {
    if (!selectedType) {
      setSelectedMarque('');
    }
    setSelectedModele('');
  }, [selectedType]);

  // Réinitialiser les modèles quand la marque change
  useEffect(() => {
    if (!selectedMarque) {
      setSelectedModele('');
    }
  }, [selectedMarque]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!numeroSerie.trim() || !selectedType || !selectedMarque || !selectedModele || !selectedMarche) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setLoading(true);
    const body = {
      numeroSerie,
      typeMaterielId: selectedType,
      marqueId: selectedMarque,
      modeleId: selectedModele,
      marcherId: selectedMarche
    };
    try {
      await addMateriel(body);
      setSuccess('Matériel ajouté avec succès !');
      // Ne réinitialiser que le numéro de série, garder les autres champs
      setNumeroSerie('');
      // Les autres champs (Type, Marque, Modèle, Marché) restent remplis
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de l'ajout du matériel.");
    }
    setLoading(false);
  };

  // Fonction pour réinitialiser tous les champs
  const handleReset = () => {
    setNumeroSerie('');
    setSelectedType('');
    setSelectedMarque('');
    setSelectedModele('');
    setSelectedMarche('');
    setError('');
    setSuccess('');
  };

  // Afficher les erreurs de chargement des données
  const displayError = error || typesError || marchesError || marquesError || modelesError;
  const isLoading = loading || typesLoading || marchesLoading || marquesLoading || modelesLoading;

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
        selectedMarche={selectedMarche}
        setSelectedMarche={setSelectedMarche}
        types={types}
        marques={marques}
        modeles={modeles}
        marches={marches}
        loading={isLoading}
        error={displayError}
        success={success}
        onSubmit={handleSubmit}
        submitLabel="Ajouter le matériel"
        onReset={handleReset}
      />
    </CardLayout>
  );
};

export default AjouterMateriel; 