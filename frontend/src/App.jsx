import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Les imports des pages SANS l'extension .jsx, React s'en charge
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import { Toaster } from 'react-hot-toast'; 
import ProtectedRoute from './components/routing/ProtectedRoute'; // <-- IMPORTER NOTRE GARDE DU CORPS


import './App.css'; 

function App() {
  return (
    <BrowserRouter>

 <Toaster 
        position="top-center"
        reverseOrder={false}
        // --- NOUVEAUTÉ : Ajout des options de style ---
        toastOptions={{
          // Style par défaut pour tous les toasts
          className: '',
          duration: 5000, // Durée par défaut
          style: {
            background: '#363636',
            color: '#fff',
          },

          // Styles spécifiques pour les toasts de succès
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
            // On peut même changer l'icône par défaut !
            iconTheme: {
              primary: '#16a34a', // Vert soutenu
              secondary: '#fff',
            },
            style: {
              background: '#dcfce7', // Un fond vert très clair
              color: '#15803d', // Un texte vert foncé
              border: '1px solid #16a34a',
            },
          },

          // Styles spécifiques pour les toasts d'erreur
          error: {
            iconTheme: {
              primary: '#ef4444', // Rouge
              secondary: '#fff',
            },
            style: {
              background: '#fee2e2', // Un fond rouge très clair
              color: '#b91c1c', // Un texte rouge foncé
              border: '1px solid #ef4444',
            },
          },
        }}
      />
       <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;