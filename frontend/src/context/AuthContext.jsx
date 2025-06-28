/* eslint-disable react-refresh/only-export-components */
// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// CORRECTION 1 : On ajoute "export" ici
export const AuthContext = createContext();

axios.defaults.baseURL = 'http://localhost:4000'; // Bonne pratique : définir l'URL de base

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('chat-token');
      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
        try {
          const res = await axios.get('/api/auth/me'); // Utilise le chemin relatif
          setUser(res.data);
        } catch (err) {
          console.error('Token invalide, déconnexion.', err);
          localStorage.removeItem('chat-token');
          delete axios.defaults.headers.common['x-auth-token'];
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('chat-token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
    toast.success('Vous avez été déconnecté.');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// CORRECTION 2 : On supprime la ligne "export default" qui n'est plus nécessaire
// export default AuthContext;

















// // frontend/context/AuthContext.jsx

// import React, { createContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const loadUser = async () => {
//             const token = localStorage.getItem('chat-token');
//             if (token) {
//                 axios.defaults.headers.common['x-auth-token'] = token;
//                 try {
//                     const res = await axios.get('http://localhost:4000/api/auth/me');
//                     setUser(res.data);
//                 } catch (err) {
//                     console.error("Token invalide, déconnexion.", err);
//                     localStorage.removeItem('chat-token');
//                     delete axios.defaults.headers.common['x-auth-token'];
//                 }
//             }
//             setLoading(false);
//         };
//         loadUser();
//     }, []);

//     const logout = (navigate) => {
//         localStorage.removeItem('chat-token');
//         delete axios.defaults.headers.common['x-auth-token'];
//         setUser(null);
//         toast.success("Vous avez été déconnecté.");
//         if (navigate) {
//             navigate('/login');
//         }
//     };

//     return (
//         <AuthContext.Provider value={{ user, setUser, loading, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export default AuthContext;