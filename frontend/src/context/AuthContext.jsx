// frontend/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('chat-token');
            if (token) {
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    const res = await axios.get('http://localhost:4000/api/auth/me');
                    setUser(res.data);
                } catch (err) {
                    console.error("Token invalide, déconnexion.", err);
                    localStorage.removeItem('chat-token');
                    delete axios.defaults.headers.common['x-auth-token'];
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const logout = (navigate) => {
        localStorage.removeItem('chat-token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
        toast.success("Vous avez été déconnecté.");
        if (navigate) {
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;