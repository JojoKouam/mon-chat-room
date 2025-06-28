// frontend/src/components/chat/SettingsModal.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './SettingsModal.css'; // Ton CSS pour le style sombre

const SettingsModal = ({ onClose }) => {
    const { user, setUser } = useContext(AuthContext);
    
    const [formData, setFormData] = useState({
        username: user?.username || '',
        age: user?.age || '',
        gender: user?.gender || ''
    });

    const [blockedUsers, setBlockedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBlockedUsers = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get('/api/users/me/blocked');
                setBlockedUsers(res.data);
            } catch {
                toast.error("Impossible de charger les utilisateurs bloqués.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlockedUsers();
    }, []);

    // --- DÉBUT DES AJOUTS POUR L'AVATAR ---
    
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        const toastId = toast.loading("Changement de l'avatar...");
        
        try {
            // 1. Uploader le fichier et obtenir l'URL de Cloudinary
            const uploadRes = await axios.post('/api/upload', formData);
            const newAvatarUrl = uploadRes.data.url;

            // 2. Mettre à jour le profil de l'utilisateur avec la nouvelle URL
            const profileUpdateRes = await axios.put('/api/users/me', { avatar_url: newAvatarUrl });
            
            // 3. Mettre à jour le context pour que toute l'appli voie le nouvel avatar
            setUser(profileUpdateRes.data);
            toast.success('Avatar mis à jour !', { id: toastId });

        } catch {
            toast.error("Erreur lors du changement d'avatar.", { id: toastId });
        }
    };

    // --- FIN DES AJOUTS POUR L'AVATAR ---


    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Mise à jour du profil...');
        try {
            const res = await axios.put('/api/users/me', formData);
            setUser(prevUser => ({ ...prevUser, ...res.data })); // Met à jour le context
            toast.success('Profil mis à jour !', { id: toastId });
            onClose(); // Ferme la modale après succès
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur de mise à jour.', { id: toastId });
        }
    };
    
    const handleUnblock = async (userId) => {
        try {
            await axios.post(`/api/users/unblock/${userId}`);
            setBlockedUsers(prev => prev.filter(u => u.id !== userId));
            toast.success("Utilisateur débloqué.");
        } catch {
            toast.error("Erreur lors du déblocage.");
        }
    };

    if (!user) return null;

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div className="settings-modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                
                <div className="profile-header">
                    <label htmlFor="avatar-file-input" className="avatar-upload-container">
                        <img src={user.avatar_url} alt="avatar" className="profile-avatar-large"/>
                        <div className="upload-overlay">Changer</div>
                    </label>
                    <input 
                        id="avatar-file-input" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarUpload} 
                    /> 
                    <h2>{user.username}</h2>
                    <p>Mettez à jour vos informations pour de meilleures correspondances.</p>
                </div>
                
                <form onSubmit={handleFormSubmit}>
                    <label>Nom d'utilisateur</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} />

                    <label>Âge</label>
                    <input type="number" name="age" value={formData.age} onChange={handleInputChange} />
                    
                    <label>Genre</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                        <option value="autre">Autre</option>
                        <option value="pas-de-preference">Pas de préférence</option>
                    </select>

                    <button type="submit" className="save-changes-btn">Enregistrer les modifications</button>
                </form>

                <div className="blocked-users-section">
                    <h3>Utilisateurs Bloqués</h3>
                    <ul className="blocked-list">
                        {isLoading ? <p>Chargement...</p> : 
                         blockedUsers.length > 0 ? blockedUsers.map(bu => (
                            <li key={bu.id} className="blocked-item">
                                <img src={bu.avatar_url} alt={bu.username} />
                                <span>{bu.username}</span>
                                <button onClick={() => handleUnblock(bu.id)} className="unblock-btn">Débloquer</button>
                            </li>
                        )) : (
                            <p>Vous n'avez bloqué aucun utilisateur.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;