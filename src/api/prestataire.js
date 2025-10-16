import axios from 'axios';
import { API_URL } from './auth';
import { getToken } from '../utils/storage';

export const getPrestataires = () =>
  axios.get(`${API_URL}/api/prestataires`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const getPrestataire = (id) =>
  axios.get(`${API_URL}/api/prestataires/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const addPrestataire = (data) =>
  axios.post(`${API_URL}/api/prestataires`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const updatePrestataire = (id, data) =>
  axios.put(`${API_URL}/api/prestataires/${id}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const deletePrestataire = (id) =>
  axios.delete(`${API_URL}/api/prestataires/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
