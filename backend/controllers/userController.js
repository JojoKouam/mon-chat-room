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