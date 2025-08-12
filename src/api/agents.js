// Fonctions pour les endpoints agents
import axios from 'axios';
import { API_URL } from './auth';
import { getToken } from '../utils/storage';

export const getAgents = () =>
  axios.get(`${API_URL}/api/agents`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const getAgentById = (id) =>
  axios.get(`${API_URL}/api/agents/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const createAgent = (agentData) =>
  axios.post(`${API_URL}/api/agents`, agentData, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const updateAgent = (id, agentData) =>
  axios.put(`${API_URL}/api/agents/${id}`, agentData, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const deleteAgent = (id) =>
  axios.delete(`${API_URL}/api/agents/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

// Fonctions pour les données de référence
export const getDirections = () =>
  axios.get(`${API_URL}/api/directions`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const getDepartements = () =>
  axios.get(`${API_URL}/api/departements`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const getServices = () =>
  axios.get(`${API_URL}/api/services`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

// Nouvelles fonctions pour le filtrage dynamique
export const getDepartementsByDirection = (directionId) =>
  axios.get(`${API_URL}/api/departements/direction/${directionId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const getServicesByDepartement = (departementId) =>
  axios.get(`${API_URL}/api/services/departement/${departementId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  }); 