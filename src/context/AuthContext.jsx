import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('radio_token'));
  const [assignedStations, setAssignedStations] = useState([]);
  const [activeAdminStation, setActiveAdminStation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    async function verifyAuth() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.get('/auth/me');
        setUser(data.user);
        setAssignedStations(data.assignedStations || []);

        // Default active station
        const savedStationId = localStorage.getItem('radio_active_station_id');
        const found = data.assignedStations?.find(s => s.id === savedStationId);
        if (found) {
          setActiveAdminStation(found);
        } else if (data.assignedStations?.length > 0) {
          setActiveAdminStation(data.assignedStations[0]);
          localStorage.setItem('radio_active_station_id', data.assignedStations[0].id);
        }
      } catch (err) {
        console.warn('[Auth] Session invalid or expired:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, [token]);

  const login = async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    localStorage.setItem('radio_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setAssignedStations(data.assignedStations || []);

    if (data.assignedStations?.length > 0) {
      setActiveAdminStation(data.assignedStations[0]);
      localStorage.setItem('radio_active_station_id', data.assignedStations[0].id);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('radio_token');
    localStorage.removeItem('radio_active_station_id');
    setToken(null);
    setUser(null);
    setAssignedStations([]);
    setActiveAdminStation(null);
  };

  const switchActiveStation = (station) => {
    setActiveAdminStation(station);
    localStorage.setItem('radio_active_station_id', station.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        assignedStations,
        activeAdminStation,
        setActiveAdminStation,
        switchActiveStation,
        login,
        logout,
        loading,
        isSuperAdmin: user?.role === 'superadmin',
        isStationAdmin: user?.role === 'stationadmin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
