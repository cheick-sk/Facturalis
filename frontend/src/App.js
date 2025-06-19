import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Clients from "./components/Clients";
import Invoices from "./components/Invoices";
import Layout from "./components/Layout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token and get user info
      fetch(`${API}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Token invalid');
      })
      .then(userData => {
        setUser(userData);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch(`${API}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      return true;
    }
    return false;
  };

  const register = async (email, name, password) => {
    const response = await fetch(`${API}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, name, password })
    });

    if (response.ok) {
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return { user, token, login, register, logout, loading };
};

function App() {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              auth.token ? <Navigate to="/dashboard" /> : 
              <Login onLogin={auth.login} />
            } 
          />
          <Route 
            path="/register" 
            element={
              auth.token ? <Navigate to="/dashboard" /> : 
              <Register onRegister={auth.register} />
            } 
          />
          <Route 
            path="/" 
            element={
              auth.token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            } 
          />
          
          {/* Protected Routes */}
          {auth.token ? (
            <Route path="/" element={<Layout user={auth.user} onLogout={auth.logout} />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="invoices" element={<Invoices />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;