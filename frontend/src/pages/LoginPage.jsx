// frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link} from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
// CORRECTION : On n'importe plus du tout le contexte ici, on n'en a pas besoin.

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Connexion en cours...');

    try {
      // L'appel axios est déjà parfait
      const promise = axios.post('/api/auth/login', formData);
      const res = await promise;
      
      toast.dismiss(loadingToast); // On ferme le toast de chargement

      // --- CORRECTION MAJEURE DE LA LOGIQUE ---
      const { token, user } = res.data; // On récupère le token et l'utilisateur

      // 1. Stocker le token dans le localStorage
      localStorage.setItem('chat-token', token);

      // 2. Mettre à jour les headers axios par défaut pour les futures requêtes
      axios.defaults.headers.common['x-auth-token'] = token;

      // 3. Afficher un message de succès et rediriger
      toast.success(`Connexion réussie ! Bienvenue, ${user.username}.`);
      
      // 4. Rediriger vers la page principale. On peut forcer un rechargement pour
      // être sûr que le AuthProvider exécute son useEffect.
      window.location.href = '/'; 
      // Alternative: navigate('/', { replace: true });

    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Connexion</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group input-container">
            <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Mot de passe" required value={formData.password} onChange={handleChange} />
            <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</span>
          </div>
          <button type="submit" className="btn-primary">Se connecter</button>
        </form>
        <div className="auth-links">
          <p>Vous n'avez pas de compte ? <Link to="/register">Inscrivez-vous</Link></p>
        </div>
      </div>
    </div>
  );
}













// import React, { useState, useContext } from 'react'; // Importer useContext
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import AuthContext from '../context/AuthContext'; // Importer le contexte

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const { setUser } = useContext(AuthContext); // Récupérer la fonction setUser

//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({ email: '', password: '' });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     const promise = axios.post('http://localhost:4000/api/auth/login', formData);
      
//     toast.promise(
//       promise,
//       {
//         loading: 'Connexion en cours...',
//         success: (res) => {
//           // --- MISE À JOUR DE LA LOGIQUE DE SUCCÈS ---
//           const { token, user } = res.data; // On récupère le token ET l'utilisateur

//           // 1. Stocker le token
//           localStorage.setItem('chat-token', token);
//           // 2. Dire à axios de l'utiliser pour les futures requêtes
//           axios.defaults.headers.common['x-auth-token'] = token;
//           // 3. Mettre à jour l'état global de l'utilisateur dans le contexte
//           setUser(user);

//           // 4. Rediriger
//           navigate('/'); 
//           return `Connexion réussie ! Bienvenue, ${user.username}.`;
//         },
//         error: (err) => {
//           return err.response?.data?.message || "Une erreur est survenue.";
//         }
//       }
//     );
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-card">
//         <h1>Connexion</h1>
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleChange} />
//           </div>
//           <div className="form-group password-input-container">
//             <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Mot de passe" required value={formData.password} onChange={handleChange}/>
//             <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</span>
//           </div>
//           <button type="submit" className="btn-primary">Se connecter</button>
//         </form>
//         <div className="auth-links">
//           <p>
//             Vous n'avez pas de compte ? <Link to="/register">Inscrivez-vous</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }