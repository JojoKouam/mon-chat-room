import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('chat-token');
      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          localStorage.removeItem('chat-token');
          delete axios.defaults.headers.common['x-auth-token'];
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  // CORRECTION : On enveloppe login et logout dans useCallback pour les stabiliser
   const login = useCallback(async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('chat-token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // La mise à jour de l'état `user` va déclencher le re-rendu de HomeRedirect,
      // qui s'occupera de la redirection.
      setUser(res.data.user); 
      
      toast.success('Connexion réussie !');
      
      // CORRECTION : On enlève cette ligne.
      // navigate('/chat'); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Une erreur est survenue.');
    }
  }, []); 

  const logout = useCallback(() => {
    localStorage.removeItem('chat-token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
    toast.success('Vous avez été déconnecté.');
    navigate('/login');
  }, [navigate]);

  // useMemo garantit que la valeur du contexte ne change que si user ou loading changent réellement
  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
  }), [user, loading, login, logout]); // On ajoute login et logout aux dépendances

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};