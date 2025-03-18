import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, setToken, removeToken } from "../utils/storage";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const login = (token) => {
    setToken(token);
    setIsLoggedIn(true);
    navigate("/profile", { replace: true }); // ✅ Ensure clean navigation
  };

  const logout = () => {
    console.log("Logging out..."); // ✅ Debugging
    removeToken();
    setIsLoggedIn(false);

    // ✅ Wait for state update before navigating
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
