const db = require('../config/db');

// Rechercher des utilisateurs par leur nom
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query; // Récupère le texte depuis l'URL (ex: /search?query=rol)
        const currentUserId = req.user.id; // L'utilisateur qui fait la recherche

        if (!query) {
            return res.json([]); // Si la recherche est vide, on ne renvoie rien
        }

        // On cherche les utilisateurs dont le nom commence par la requête,
        // et on s'exclut soi-même des résultats.
        const [users] = await db.query(
            'SELECT id, username, email FROM users WHERE username LIKE ? AND id != ? LIMIT 10',
            [`${query}%`, currentUserId]
        );

        res.status(200).json(users);

    } catch (error) {
        console.error("Erreur de recherche d'utilisateurs :", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// NOUVELLE FONCTION : Lister tous les utilisateurs (sauf soi-même)
exports.listAllUsers = async (req, res) => {
  const currentUserId = req.user.id;
  try {
    const [users] = await db.query(
      'SELECT id, username, email FROM users WHERE id != ?',
      [currentUserId]
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur dans listAllUsers:", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// NOUVELLE FONCTION : Récupérer le profil d'un utilisateur par son ID
exports.getUserProfile = async (req, res) => {
  try {
     const [users] = await db.query(
      'SELECT id, username, email, age, gender, intention, avatar_url, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.status(200).json(users[0]);
  } catch (error) {
    console.error("Erreur dans getUserProfile:", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


// Dans backend/controllers/userController.js

exports.updateCurrentUser = async (req, res) => {
    const userId = req.user.id;
    const { username, email, avatar_url } = req.body; // On ne permet de changer que ces champs

    // On pourrait ajouter beaucoup de validation ici (le username est-il déjà pris ?, etc.)
    // Mais pour l'instant, gardons ça simple.

    try {
        const fieldsToUpdate = {};
        if (username) fieldsToUpdate.username = username;
        if (email) fieldsToUpdate.email = email;
        if (avatar_url) fieldsToUpdate.avatar_url = avatar_url;

        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ message: "Aucun champ à mettre à jour." });
        }

        // Construction de la requête SQL dynamiquement
        const query = `UPDATE users SET ? WHERE id = ?`;
        await db.query(query, [fieldsToUpdate, userId]);

        // On renvoie les nouvelles informations de l'utilisateur
        const [updatedUser] = await db.query('SELECT id, username, email, avatar_url FROM users WHERE id = ?', [userId]);
        
        res.status(200).json(updatedUser[0]);

    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil :", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};



// METTRE À JOUR LE PROFIL UTILISATEUR
exports.updateCurrentUserProfile = async (req, res) => {
    const userId = req.user.id;
    // On récupère uniquement les champs que tu veux rendre modifiables
    const { username, age, gender,avatar_url } = req.body;
    
    // On construit un objet avec uniquement les champs qui ont été fournis
    const fieldsToUpdate = {};
    if (username !== undefined) fieldsToUpdate.username = username;
    if (age !== undefined) fieldsToUpdate.age = age;
    if (gender !== undefined) fieldsToUpdate.gender = gender;
    if (avatar_url !== undefined) fieldsToUpdate.avatar_url = avatar_url; // Ajoute cette ligne
    
    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: "Aucun champ à mettre à jour." });
    }

    try {
        await db.query(`UPDATE users SET ? WHERE id = ?`, [fieldsToUpdate, userId]);
        
        // On récupère l'utilisateur mis à jour pour le renvoyer au frontend
        const [rows] = await db.query('SELECT id, username, email, age, gender, intention, avatar_url FROM users WHERE id = ?', [userId]);
        const updatedUser = rows[0];
        
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Erreur de mise à jour du profil :", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// BLOQUER UN UTILISATEUR
exports.blockUser = async (req, res) => {
    const blockerId = req.user.id;
    const { userId: blockedId } = req.params;
    if (blockerId == blockedId) return res.status(400).json({ message: "Vous ne pouvez pas vous bloquer vous-même." });
    try {
        await db.query('INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)', [blockerId, blockedId]);
        res.sendStatus(201); // 201 Created
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Déjà bloqué.' });
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// DÉBLOQUER UN UTILISATEUR
exports.unblockUser = async (req, res) => {
    const blockerId = req.user.id;
    const { userId: blockedId } = req.params;
    try {
        await db.query('DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?', [blockerId, blockedId]);
        res.sendStatus(204); // 204 No Content
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// OBTENIR LA LISTE DES UTILISATEURS BLOQUÉS
exports.getBlockedUsers = async (req, res) => {
    const blockerId = req.user.id;
    try {
        const [blockedUsers] = await db.query(
            `SELECT u.id, u.username, u.avatar_url FROM blocked_users bu JOIN users u ON bu.blocked_id = u.id WHERE bu.blocker_id = ?`,
            [blockerId]
        );
        res.status(200).json(blockedUsers);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};