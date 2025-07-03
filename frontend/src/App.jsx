import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ProtectedRoute from './components/routing/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- ROUTE PROTÉGÉE PRINCIPALE --- */}
        {/* Enveloppe toutes les routes nécessitant une connexion */}
        <Route 
          path="/*" // Intercepte TOUT le reste
          element={
            <ProtectedRoute>
              <Routes>
                {/* On définit les routes internes à la partie protégée */}
                <Route 
                  path="/chat/*" 
                  element={
                    <ChatProvider>
                      <ChatPage />
                    </ChatProvider>
                  } 
                />
                {/* La route par défaut si on est connecté est /chat */}
                <Route path="*" element={<Navigate to="/chat" />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
























// import React from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';

// // Les imports des pages SANS l'extension .jsx, React s'en charge
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import ChatPage from './pages/ChatPage';
// import { Toaster } from 'react-hot-toast'; 
// import ProtectedRoute from './components/routing/ProtectedRoute'; // <-- IMPORTER NOTRE GARDE DU CORPS

      
// import { ChatProvider } from './context/ChatContext.jsx';

    
// import './App.css'; 

// function App() {
//   return (

//      // à l'intérieur du BrowserRouter de main.jsx
//     <>
//       <Toaster
//         position="top-center"
//         reverseOrder={false}
//       />
//       <Routes>
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
        
//         {/* CORRECTION ARCHITECTURALE : La route principale protégée */}
//         <Route 
//           path="/*" // On utilise "/*" pour matcher toutes les routes internes au chat
//           element={
//             <ProtectedRoute>
//               {/* Le ChatProvider enveloppe la ChatPage pour lui donner toutes les données du chat */}
//               <ChatProvider>
//                 <ChatPage />
//               </ChatProvider>
//             </ProtectedRoute>
//           } 
//         />
//       </Routes>
//     </>
//   );
// }

// export default App;

    


//     <BrowserRouter>

//  <Toaster 
//         position="top-center"
//         reverseOrder={false}
//         // --- NOUVEAUTÉ : Ajout des options de style ---
//         toastOptions={{
//           // Style par défaut pour tous les toasts
//           className: '',
//           duration: 5000, // Durée par défaut
//           style: {
//             background: '#363636',
//             color: '#fff',
//           },

//           // Styles spécifiques pour les toasts de succès
//           success: {
//             duration: 3000,
//             theme: {
//               primary: 'green',
//               secondary: 'black',
//             },
//             // On peut même changer l'icône par défaut !
//             iconTheme: {
//               primary: '#16a34a', // Vert soutenu
//               secondary: '#fff',
//             },
//             style: {
//               background: '#dcfce7', // Un fond vert très clair
//               color: '#15803d', // Un texte vert foncé
//               border: '1px solid #16a34a',
//             },
//           },

//           // Styles spécifiques pour les toasts d'erreur
//           error: {
//             iconTheme: {
//               primary: '#ef4444', // Rouge
//               secondary: '#fff',
//             },
//             style: {
//               background: '#fee2e2', // Un fond rouge très clair
//               color: '#b91c1c', // Un texte rouge foncé
//               border: '1px solid #ef4444',
//             },
//           },
//         }}
//       />
//        <Routes>
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route 
//           path="/" 
//           element={
//             <ProtectedRoute>
//               <ChatPage />
//             </ProtectedRoute>
//           } 
//         />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;