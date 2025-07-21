// Fonctions pour les endpoints matériels
import axios from 'axios';
import { API_URL } from './auth';
import { getToken } from '../utils/storage';

export const getTypes = () =>
  axios.get(`${API_URL}/api/types`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const addType = (nom) =>
  axios.post(`${API_URL}/api/types`, { nom }, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const deleteType = (id) =>
  axios.delete(`${API_URL}/api/types/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const getMarques = (typeId) => {
  const url = typeId 
    ? `${API_URL}/api/marques/by-type/${typeId}`
    : `${API_URL}/api/marques`;
  return axios.get(url, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};

export const getModeles = (marqueId) => {
  if (marqueId) {
    return axios.get(`${API_URL}/api/modeles/by-marque/${marqueId}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
  } else {
    return axios.get(`${API_URL}/api/modeles`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
  }
};

export const getModelesByMarqueAndType = (marqueId, typeId) => {
  return axios.get(`${API_URL}/api/modeles/by-marque-and-type`, {
    params: { marqueId, typeId },
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};

export const getMateriels = () =>
  axios.get(`${API_URL}/api/materiels`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const addMateriel = (data) =>
  axios.post(`${API_URL}/api/materiels`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const deleteMateriel = (id) =>
  axios.delete(`${API_URL}/api/materiels/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const addMarque = (nom, typeIds) => {
  console.log('API addMarque - Données envoyées:', {
    nom,
    typeIds: typeIds.map(id => parseInt(id, 10)) // Convertir en nombres
  });
  
  return axios.post(`${API_URL}/api/marques`, {
    nom,
    typeIds: typeIds.map(id => parseInt(id, 10)) // Convertir en nombres
  }, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};

export const deleteMarque = (id) =>
  axios.delete(`${API_URL}/api/marques/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const addModele = (nom, marqueId, typeMaterielId) => {
  return axios.post(`${API_URL}/api/modeles`, {
    nom,
    marqueId,
    typeMaterielId
  }, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};

export const deleteModele = (id) =>
  axios.delete(`${API_URL}/api/modeles/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  }); 