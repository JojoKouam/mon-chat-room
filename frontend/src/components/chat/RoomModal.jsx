import React, { useState, useEffect } from 'react';
import { useChatContext } from '../../context/ChatContext';
import './RoomModal.css';

const RoomModal = ({ isOpen, onClose, roomToEdit }) => {
    const { createRoom, updateRoom } = useChatContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Si on passe une 'roomToEdit', on est en mode édition, on pré-remplit les champs
    useEffect(() => {
        if (roomToEdit) {
            setName(roomToEdit.name);
            setDescription(roomToEdit.description || '');
        } else {
            // Sinon, on est en mode création, on vide les champs
            setName('');
            setDescription('');
        }
    }, [roomToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let success = false;
        if (roomToEdit) {
            // Mode Mise à jour
            success = await updateRoom(roomToEdit.id, { name, description });
        } else {
            // Mode Création
            success = await createRoom({ name, description });
        }
        
        setIsLoading(false);
        if (success) {
            onClose(); // On ferme la modale seulement si l'opération a réussi
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{roomToEdit ? 'Modifier la salle' : 'Créer une nouvelle salle'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="room-name">Nom de la salle</label>
                        <input
                            id="room-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Passionnés de React"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="room-description">Description (optionnel)</label>
                        <textarea
                            id="room-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Décrivez le sujet de cette salle..."
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Chargement...' : (roomToEdit ? 'Enregistrer' : 'Créer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoomModal;