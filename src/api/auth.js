import axios from "axios";
import { getToken } from "../utils/storage";

const getLocalIPAddress = async () => {
  return new Promise((resolve) => {
    const peerConnection = new RTCPeerConnection({ iceServers: [] });

    peerConnection.createDataChannel("");
    peerConnection.createOffer()
      .then(offer => peerConnection.setLocalDescription(offer))
      .catch(error => console.error(error));

    peerConnection.onicecandidate = (event) => {
      if (event && event.candidate) {
        const ipMatch = event.candidate.candidate.match(
          /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/
        );
        if (ipMatch) {
          resolve(ipMatch[1]);
          peerConnection.close();
        }
      }
    };

    setTimeout(() => {
      resolve("127.0.0.1"); // Fallback to localhost
      peerConnection.close();
    }, 5000);
  });
};

// Default API_URL (will be updated dynamically)
let API_URL = `http://127.0.0.1:8081/auth`; 

// Update API_URL dynamically
getLocalIPAddress().then((ip) => {
  API_URL = `http://${ip}:8081/auth`;
  console.log("Dynamic API URL:", API_URL);
});

// API Requests
export const register = async (user) => {
  return axios.post(`${API_URL}/register`, user);
};

export const login = async (user) => {
  try {
    const response = await axios.post(`${API_URL}/login`, user);
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
