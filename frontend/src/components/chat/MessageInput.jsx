// frontend/src/components/chat/MessageInput.jsx

// import React, { useState, useRef } from 'react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// import EmojiPicker, { Theme } from 'emoji-picker-react';
// import {useChatContext } from '../../context/ChatContext';
// import './MessageInput.css';

// export default function MessageInput() {
//   const { sendMessage, emitStartTyping, emitStopTyping } = useChatContext();
  
//   const [message, setMessage] = useState('');
//   const [isPickerVisible, setPickerVisible] = useState(false);
//   const fileInputRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   const handleEmojiClick = (emojiObject) => {
//     setMessage((prevMessage) => prevMessage + emojiObject.emoji);
//     setPickerVisible(false);
//   };
  
//   // Fonction qui se déclenche quand l'utilisateur tape du texte
//   const handleTyping = (event) => {
//     // On met à jour l'état du message
//     setMessage(event.target.value);
    
//     // On envoie l'événement "start_typing"
//     emitStartTyping();
    
//     // On efface le timeout précédent
//     clearTimeout(typingTimeoutRef.current);
    
//     // On programme un événement "stop_typing" dans 2 secondes
//     typingTimeoutRef.current = setTimeout(() => {
//       emitStopTyping();
//     }, 2000);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (message.trim()) {
//       sendMessage(message, 'text'); // On précise bien le type
//       setMessage('');
//       // On arrête le timeout et on envoie "stop_typing" immédiatement
//       clearTimeout(typingTimeoutRef.current);
//       emitStopTyping();
//     }
//   };

  // const handleFileChange = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const formData = new FormData();
  //   formData.append('file', file);
  //   const toastId = toast.loading('Envoi du fichier...');

  //   try {
  //     const res = await axios.post('http://localhost:4000/api/upload', formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     });
  //     sendMessage(res.data.url, 'image'); // On utilise sendMessage pour les images aussi
  //     toast.success('Fichier envoyé !', { id: toastId });
  //   } catch (err) {
  //     console.error('Erreur d\'upload :', err);
  //     toast.error('Erreur lors de l\'envoi du fichier.', { id: toastId });
  //   }
  // };

//   return (
//     <div className='message-input-container'>
//       {isPickerVisible && (
//         <div className='emoji-picker-wrapper'>
//           <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT} height={350} width="100%" lazyLoadEmojis={true} />
//         </div>
//       )}

//       <form className="message-input-form" onSubmit={handleSubmit}>
//         <button type="button" className="emoji-button" onClick={() => setPickerVisible(!isPickerVisible)}>🙂</button>
//         <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
//         <button type="button" className="file-button" onClick={() => fileInputRef.current.click()}>📎</button>
        
//         <input
//           type="text"
//           placeholder="Écrivez votre message..."
//           value={message}
//           onChange={handleTyping} // CORRECTION : On utilise onChange pour gérer la frappe
//           onFocus={() => setPickerVisible(false)}
//         />
        
//         <button type="submit" className="send-button">Envoyer</button>
//       </form>
//     </div>
//   );
// }



import React, { useState, useRef } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Picker from 'emoji-picker-react';
import './MessageInput.css';

export default function MessageInput() {
  const { sendMessage, emitStartTyping, emitStopTyping } = useChatContext();

  const [message, setMessage] = useState('');
  const [isPickerVisible, setPickerVisible] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleEmojiClick = (emojiObject) => {
    setMessage(prevMessage => prevMessage + emojiObject.emoji);
    setPickerVisible(false);
  };
  
  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    // Gérer "is typing..."
    if (!typingTimeoutRef.current) {
      emitStartTyping();
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
      typingTimeoutRef.current = null;
    }, 2000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Envoi du fichier...');
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // On utilise sendMessage avec le type 'image' et l'URL renvoyée par Cloudinary
      sendMessage(res.data.url, 'image');
      toast.success('Fichier envoyé !', { id: toastId });
    } catch (err) {
      console.error('Erreur d\'upload :', err);
      toast.error("L'envoi du fichier a échoué.", { id: toastId });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // CORRECTION : C'EST LA LIGNE QUI CHANGE TOUT
      // On passe directement la variable `message`, qui est un string.
      sendMessage(message, 'text');
      
      setMessage(''); // Vider le champ
      clearTimeout(typingTimeoutRef.current);
      emitStopTyping();
      typingTimeoutRef.current = null;
    }
  };

  return (
    <div className="message-input-container">
      {isPickerVisible && (
        <div className="emoji-picker-wrapper">
          <Picker onEmojiClick={handleEmojiClick} theme="light" lazyLoadEmojis={true} />
        </div>
      )}
      <form className="message-input-form" onSubmit={handleSubmit}>
        <button type="button" className="emoji-button" onClick={() => setPickerVisible(!isPickerVisible)}>😊</button>
        <button type="button" className="file-button" onClick={() => fileInputRef.current.click()}>📎</button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
        
        <input
          type="text"
          className="message-input"
          placeholder="Écrivez votre message..."
          value={message}
          onChange={handleTyping}
          onFocus={() => setPickerVisible(false)} // Cacher les emojis si on clique sur l'input
        />
        
        <button type="submit" className="send-button">Envoyer</button>
      </form>
    </div>
  );
}