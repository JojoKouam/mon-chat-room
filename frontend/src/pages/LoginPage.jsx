import React, { useState, useContext } from 'react'; // Importer useContext
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext'; // Importer le contexte

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); // Récupérer la fonction setUser

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const promise = axios.post('http://localhost:4000/api/auth/login', formData);
      
    toast.promise(
      promise,
      {
        loading: 'Connexion en cours...',
        success: (res) => {
          // --- MISE À JOUR DE LA LOGIQUE DE SUCCÈS ---
          const { token, user } = res.data; // On récupère le token ET l'utilisateur

          // 1. Stocker le token
          localStorage.setItem('chat-token', token);
          // 2. Dire à axios de l'utiliser pour les futures requêtes
          axios.defaults.headers.common['x-auth-token'] = token;
          // 3. Mettre à jour l'état global de l'utilisateur dans le contexte
          setUser(user);

          // 4. Rediriger
          navigate('/'); 
          return `Connexion réussie ! Bienvenue, ${user.username}.`;
        },
        error: (err) => {
          return err.response?.data?.message || "Une erreur est survenue.";
        }
      }
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Connexion</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group password-input-container">
            <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Mot de passe" required value={formData.password} onChange={handleChange}/>
            <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</span>
          </div>
          <button type="submit" className="btn-primary">Se connecter</button>
        </form>
        <div className="auth-links">
          <p>
            Vous n'avez pas de compte ? <Link to="/register">Inscrivez-vous</Link>
          </p>
        </div>
      </div>
    </div>
  );
}