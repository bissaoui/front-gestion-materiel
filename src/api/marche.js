import axios from 'axios';
import { API_URL } from './auth';
import { getToken } from '../utils/storage';

export const getMarches = () =>
  axios.get(`${API_URL}/api/marchers`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const addMarche = (data) =>
  axios.post(`${API_URL}/api/marchers`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

export const deleteMarche = (id) =>
  axios.delete(`${API_URL}/api/marchers/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });


