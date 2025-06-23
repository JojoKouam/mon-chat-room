import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

// Ce composant va envelopper les routes que l'on veut protéger
export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // 1. Si on est encore en train de vérifier si un utilisateur est connecté, on n'affiche rien
  // (ou un spinner de chargement) pour éviter les "flashs" d'interface.
  if (loading) {
    return <div>Chargement de l'application...</div>;
  }

  // 2. Si le chargement est fini ET qu'il n'y a pas d'utilisateur, on redirige vers la page de connexion
  if (!user) {
    return <Navigate to="/login" replace />; // 'replace' empêche de revenir en arrière avec le bouton "précédent" du navigateur
  }

  // 3. Si le chargement est fini ET qu'il y a un utilisateur, on affiche la page demandée
  return children;
}