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