import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, setToken, removeToken } from "../utils/storage";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode"; // Ensure correct import

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

  // ✅ Function to check if token is expired
  const isTokenValid = () => {
    const token = getToken();
    console.log("Current Token:", token); // Debugging  

    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded Token:", decoded); // Debugging

      if (!decoded.exp) {
        console.warn("⚠️ Token has no expiration field!");
        return false;
      }

      return decoded.exp * 1000 > Date.now(); // Check if token is still valid
    } catch (error) {
      console.error("Invalid Token:", error);
      return false;
    }
  };

  // ✅ Auto logout if token is invalid
  const checkTokenValidity = () => {
    if (!isTokenValid()) {
      console.warn("⚠️ Token expired! Logging out...");
      logout();
    }
  };

  useEffect(() => {
    checkTokenValidity(); // ✅ Check on mount

    // ✅ Set up an interval to check every 30 seconds
    const interval = setInterval(checkTokenValidity, 30000);

    return () => clearInterval(interval); // Cleanup
  }, []);

  const login = (token) => {
    console.log("✅ User logged in!");
    setToken(token);
    setIsLoggedIn(true);
    navigate("/profile", { replace: true });
  };

  const logout = () => {
    console.log("🚪 Logging out...");
    removeToken();
    setIsLoggedIn(false);

    // ✅ Ensure navigation happens **after** state updates
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 100);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
