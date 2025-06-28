// frontend/src/components/chat/MessageInput.jsx

import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { ChatContext } from '../../context/ChatContext';
import './MessageInput.css';

export default function MessageInput() {
  const { sendMessage, emitStartTyping, emitStopTyping } = useContext(ChatContext);
  
  const [message, setMessage] = useState('');
  const [isPickerVisible, setPickerVisible] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setPickerVisible(false);
  };
  
  // Fonction qui se déclenche quand l'utilisateur tape du texte
  const handleTyping = (event) => {
    // On met à jour l'état du message
    setMessage(event.target.value);
    
    // On envoie l'événement "start_typing"
    emitStartTyping();
    
    // On efface le timeout précédent
    clearTimeout(typingTimeoutRef.current);
    
    // On programme un événement "stop_typing" dans 2 secondes
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message, 'text'); // On précise bien le type
      setMessage('');
      // On arrête le timeout et on envoie "stop_typing" immédiatement
      clearTimeout(typingTimeoutRef.current);
      emitStopTyping();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    const toastId = toast.loading('Envoi du fichier...');

    try {
      const res = await axios.post('http://localhost:4000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      sendMessage(res.data.url, 'image'); // On utilise sendMessage pour les images aussi
      toast.success('Fichier envoyé !', { id: toastId });
    } catch (err) {
      console.error('Erreur d\'upload :', err);
      toast.error('Erreur lors de l\'envoi du fichier.', { id: toastId });
    }
  };

  return (
    <div className='message-input-container'>
      {isPickerVisible && (
        <div className='emoji-picker-wrapper'>
          <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT} height={350} width="100%" lazyLoadEmojis={true} />
        </div>
      )}

      <form className="message-input-form" onSubmit={handleSubmit}>
        <button type="button" className="emoji-button" onClick={() => setPickerVisible(!isPickerVisible)}>🙂</button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
        <button type="button" className="file-button" onClick={() => fileInputRef.current.click()}>📎</button>
        
        <input
          type="text"
          placeholder="Écrivez votre message..."
          value={message}
          onChange={handleTyping} // CORRECTION : On utilise onChange pour gérer la frappe
          onFocus={() => setPickerVisible(false)}
        />
        
        <button type="submit" className="send-button">Envoyer</button>
      </form>
    </div>
  );
}