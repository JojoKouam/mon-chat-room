// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // On importe le BrowserRouter
import { AuthProvider } from './context/AuthContext.jsx'; // On importe le AuthProvider
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* CORRECTION : L'ORDRE CORRECT EST ICI */}
    <BrowserRouter>  {/* 1. Le Routeur doit envelopper tout le reste */}
      <AuthProvider> {/* 2. Le Provider d'authentification vient ensuite */}
        <App />        {/* 3. L'application principale est à l'intérieur */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);