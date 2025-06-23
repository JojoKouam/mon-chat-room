// frontend/src/components/chat/MessageInput.jsx

import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import ChatContext from '../../context/ChatContext';
import './MessageInput.css';

export default function MessageInput() {
  const { sendMessage } = useContext(ChatContext);
  const [message, setMessage] = useState('');
  const [isPickerVisible, setPickerVisible] = useState(false);
  const fileInputRef = useRef(null);

  const handleEmojiClick = (emojiObject) => {
    setMessage(prevMessage => prevMessage + emojiObject.emoji);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message, 'text'); // On précise que c'est un message de type 'text'
      setMessage('');
      setPickerVisible(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Envoi du fichier...');

    try {
      // --- CORRECTION CRUCIALE : L'URL complète de notre backend ---
      const res = await axios.post('http://localhost:4000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // -----------------------------------------------------------

      // On envoie l'URL de l'image reçue comme un message de type 'image'
      sendMessage(res.data.url, 'image');

      toast.success('Fichier envoyé !', { id: toastId });

    } catch (err) {
      console.error("Erreur d'upload :", err);
      toast.error('Erreur lors de l\'envoi du fichier.', { id: toastId });
    }
  };

  return (
    <div className="message-input-container">
      {isPickerVisible && (
        <div className="emoji-picker-wrapper">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT} height={350} width="100%" lazyLoadEmojis={true} />
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <button type="button" className="emoji-button" onClick={() => setPickerVisible(!isPickerVisible)}>😊</button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" /> {/* On peut limiter aux images */}
        <button type="button" className="file-button" onClick={() => fileInputRef.current.click()}>📎</button>
        
        <input 
          type="text" 
          placeholder="Écrivez votre message..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setPickerVisible(false)}
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}