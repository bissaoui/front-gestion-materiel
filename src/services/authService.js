import axios from "axios";

const API_URL = "http://localhost:8081/auth"; // Change if backend URL is different

export const register = async (user) => {
  try {
    const response = await axios.post(`${API_URL}/register`, user);
    return response.data;
  } catch (error) {
    throw error.response.data; // Handle errors
  }
};

export const login = async (user) => {
  try {
    const response = await axios.post(`${API_URL}/login`, user);
    localStorage.setItem("token", response.data); // Store token
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logout = () => {
  localStorage.removeItem("token"); // Remove token on logout
};

