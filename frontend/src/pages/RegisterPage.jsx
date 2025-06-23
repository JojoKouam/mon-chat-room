import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; // L'outil pour nos notifications

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // Les états pour les champs du formulaire et la visibilité des mots de passe
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    intention: ''
  });

  // La fonction pour mettre à jour le formulaire reste la même
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // La fonction de soumission, nettoyée pour utiliser uniquement toast
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    
    // On retire le champ de confirmation avant d'envoyer
    const { confirmPassword: _, ...dataToSend } = formData;

    // Utilisation de toast.promise pour une UX parfaite
    const promise = axios.post('http://localhost:4000/api/auth/register', dataToSend);
      
    toast.promise(
      promise,
      {
        loading: 'Création de votre compte en cours...',
        success: (res) => {
          // On attend 1.5s pour que l'utilisateur lise le message, puis on redirige
          setTimeout(() => navigate('/login'), 1500); 
          return `Bienvenue, ${res.data.username} ! Inscription réussie.`;
        },
        error: (err) => {
          // On affiche le message d'erreur clair renvoyé par le backend
          return err.response?.data?.message || "Une erreur inconnue est survenue.";
        }
      }
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Inscription</h1>
        
        {/* On n'a plus besoin d'afficher l'erreur ici, toast s'en charge */}
        
        <form onSubmit={handleSubmit}>
          {/* Le JSX de ton formulaire est déjà parfait et n'a pas besoin de changer */}
          {/* ... (tous tes inputs et selects) ... */}
          <div className="form-group">
            <input type="text" name="username" placeholder="Nom d'utilisateur" required value={formData.username} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group password-input-container">
            <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Mot de passe" required value={formData.password} onChange={handleChange}/>
            <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</span>
          </div>
          <div className="form-group password-input-container">
            <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirmer le mot de passe" required value={formData.confirmPassword} onChange={handleChange}/>
            <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? '🙈' : '👁️'}</span>
          </div>
          <div className="form-group">
            <input type="number" name="age" placeholder="Âge" required min="13" value={formData.age} onChange={handleChange} />
          </div>
          <div className="form-group">
            <select name="gender" required value={formData.gender} onChange={handleChange}>
              <option value="" disabled>Genre</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>
          <div className="form-group">
            <select name="intention" required value={formData.intention} onChange={handleChange}>
              <option value="" disabled>Amitié</option>
              <option value="rencontre-simple">Rencontre simple</option>
              <option value="connaissance">Connaissance</option>
              <option value="mariage">Mariage</option>
              <option value="pas-de-preference">Pas de préférence</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Créer mon compte</button>
        </form>

        <div className="auth-links">
          <p>
            Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
          </p>
        </div>
      </div>
    </div>
  );
}