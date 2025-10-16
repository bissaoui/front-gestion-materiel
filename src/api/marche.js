import axios from 'axios';
import { API_URL } from './auth';
import { getToken } from '../utils/storage';

export const getMarches = () =>
  axios.get(`${API_URL}/api/marches`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const addMarche = (data) =>
  axios.post(`${API_URL}/api/marches`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const updateMarche = (id, data) =>
  axios.put(`${API_URL}/api/marches/${id}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const deleteMarche = (id) =>
  axios.delete(`${API_URL}/api/marches/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });


