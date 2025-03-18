import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { login as authLogin } from "../api/auth"; // Import login function

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  // ✅ Prevent rendering if already logged in
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/profile", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true);
  
    try {
      const token = await authLogin(credentials);
      if (token) {
        auth.login(token);
        navigate("/profile", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message); // ✅ Show correct error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <form onSubmit={handleLogin} className="p-4 border rounded shadow-sm">
        <h2 className="mb-3">Login</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <input
          type="text"
          placeholder="Username"
          className="form-control mb-2"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="form-control mb-3"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          required
        />
        
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
