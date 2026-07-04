import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configure axios for credentials
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    axios.get('/me')
      .then(response => {
        setUser(response.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('/login', { email, password });
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await axios.post('/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
