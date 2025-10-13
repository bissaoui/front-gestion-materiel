import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook personnalisé pour synchroniser les données entre les onglets
 * Utilise localStorage et les événements storage pour détecter les changements
 */
export const useDataSync = (dataType, fetchFunction, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Utiliser useRef pour stabiliser la fonction fetchFunction
  const fetchFunctionRef = useRef(fetchFunction);
  fetchFunctionRef.current = fetchFunction;

  // Fonction pour charger les données
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchFunctionRef.current();
      const newData = Array.isArray(response.data) ? response.data : [];
      setData(newData);
      
      // Sauvegarder dans localStorage avec timestamp
      const dataWithTimestamp = {
        data: newData,
        timestamp: Date.now()
      };
      localStorage.setItem(`${dataType}_cache`, JSON.stringify(dataWithTimestamp));
    } catch (err) {
      setError(err.response?.data?.message || `Erreur lors du chargement des ${dataType}`);
      console.error(`Erreur lors du chargement des ${dataType}:`, err);
    }
    setLoading(false);
  }, [dataType]);

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Charger les données quand les dépendances changent
  useEffect(() => {
    if (dependencies.length > 0) {
      loadData();
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  // Écouter les changements de localStorage (synchronisation entre onglets)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === `${dataType}_cache` && e.newValue) {
        try {
          const cachedData = JSON.parse(e.newValue);
          if (cachedData.data && Array.isArray(cachedData.data)) {
            setData(cachedData.data);
          }
        } catch (err) {
          console.error(`Erreur lors de la synchronisation des ${dataType}:`, err);
        }
      }
    };

    // Écouter les changements de localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Écouter les événements personnalisés (pour le même onglet)
    const customEventName = `${dataType}_updated`;
    const handleCustomEvent = () => {
      loadData();
    };
    
    window.addEventListener(customEventName, handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(customEventName, handleCustomEvent);
    };
  }, [dataType, loadData]);

  // Fonction pour forcer le rechargement
  const refresh = () => {
    loadData();
  };

  // Fonction pour émettre un événement de mise à jour
  const notifyUpdate = () => {
    const customEventName = `${dataType}_updated`;
    window.dispatchEvent(new CustomEvent(customEventName));
  };

  return {
    data,
    loading,
    error,
    refresh,
    notifyUpdate
  };
};

/**
 * Hook spécialisé pour les marchés
 */
export const useMarchesSync = () => {
  const { getMarches } = require('../api/marche');
  return useDataSync('marches', getMarches);
};

/**
 * Hook spécialisé pour les types
 */
export const useTypesSync = () => {
  const { getTypes } = require('../api/materiel');
  return useDataSync('types', getTypes);
};

/**
 * Hook spécialisé pour les marques
 */
export const useMarquesSync = (typeId) => {
  const { getMarques } = require('../api/materiel');
  return useDataSync('marques', () => getMarques(typeId), [typeId]);
};

/**
 * Hook spécialisé pour les modèles
 */
export const useModelesSync = (marqueId, typeId) => {
  const { getModelesByMarqueAndType, getModeles } = require('../api/materiel');
  const fetchFunction = marqueId && typeId 
    ? () => getModelesByMarqueAndType(marqueId, typeId)
    : marqueId 
    ? () => getModeles(marqueId)
    : () => Promise.resolve({ data: [] });
  
  return useDataSync('modeles', fetchFunction, [marqueId, typeId]);
};
