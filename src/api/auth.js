import axios from "axios";
import { getToken } from "../utils/storage";


// Default API_URL (will be updated dynamically)
export const API_URL = `http://10.10.120.61:8081`;




// API Requests
export const register = async (user) => {
  return axios.post(`${API_URL}/auth/register`, user);
};

export const login = async (user) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, user);
    localStorage.setItem("token", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error("Incorrect password or username");
      } else if (error.response.status === 404) {
        throw new Error("User not found");
      } else {
        throw new Error(error.response.data.message || "Login failed");
      }
    } else if (error.request) {
      throw new Error("Network error, please try again.");
    } else {
      throw new Error("Something went wrong. Please try again.");
    }
  }
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getProfile = async () => {
  return axios.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};
