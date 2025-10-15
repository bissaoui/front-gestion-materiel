import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getToken, setToken, removeToken } from "../utils/storage";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode"; // Ensure correct import

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const [user, setUser] = useState(null);

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

  const logout = useCallback(() => {
    console.log("🚪 Logging out...");
    removeToken();
    setIsLoggedIn(false);
    setUser(null);
    // ✅ Ensure navigation happens **after** state updates
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 100);
  }, [navigate]);

  // ✅ Auto logout if token is invalid
  const checkTokenValidity = useCallback(() => {
    if (!isTokenValid()) {
      console.warn("⚠️ Token expired! Logging out...");
      logout();
    }
  }, [logout]);

  useEffect(() => {
    checkTokenValidity(); // ✅ Check on mount

    // Décode le token pour obtenir l'utilisateur
    const token = getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }

    // ✅ Set up an interval to check every 30 seconds
    const interval = setInterval(checkTokenValidity, 30000);

    return () => clearInterval(interval); // Cleanup
  }, [checkTokenValidity]);

  const login = (token) => {
    console.log("✅ User logged in!");
    setToken(token);
    setIsLoggedIn(true);
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (e) {
      setUser(null);
    }
    navigate("/profile", { replace: true });
  };


  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
