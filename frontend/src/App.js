import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import EventDiscovery from './pages/EventDiscovery';
import EventDetails from './pages/EventDetails';
import Portfolio from './pages/Portfolio';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import TreasurerDashboard from './pages/TreasurerDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import { Toaster } from './components/ui/sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, API }}>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
            <Route
              path="/dashboard"
              element={
                user ? (
                  user.role === 'student' ? <StudentDashboard /> :
                  user.role === 'coordinator' ? <CoordinatorDashboard /> :
                  user.role === 'treasurer' ? <TreasurerDashboard /> :
                  user.role === 'faculty' ? <FacultyDashboard /> :
                  <StudentDashboard />
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route path="/events" element={user ? <EventDiscovery /> : <Navigate to="/auth" />} />
            <Route path="/events/:id" element={user ? <EventDetails /> : <Navigate to="/auth" />} />
            <Route path="/portfolio" element={user ? <Portfolio /> : <Navigate to="/auth" />} />
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;