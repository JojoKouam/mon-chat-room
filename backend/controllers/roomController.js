const db = require('../config/db');

// Récupérer tous les salons
exports.getAllRooms = async (req, res) => {
    try {
        const userId = req.user.id;

        // On fait deux requêtes en parallèle
        const [allRooms] = await db.query('SELECT * FROM rooms ORDER BY nom ASC');
        const [myRoomMemberships] = await db.query('SELECT room_id FROM room_members WHERE user_id = ?', [userId]);

        // On transforme le résultat en un simple tableau d'IDs: [1, 2]
        const myRoomIds = myRoomMemberships.map(m => m.room_id);

        // On renvoie un objet contenant les deux listes
        res.status(200).json({
            allRooms,
            myRoomIds
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des salons :", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Rejoindre un salon
exports.joinRoom = async (req, res) => {
    try {
        const userId = req.user.id; // Vient de notre authMiddleware
        const { roomId } = req.params; // Vient de l'URL, ex: /api/rooms/3/join

        // Vérifier si l'utilisateur n'est pas déjà dans le salon
        const [existing] = await db.query(
            'SELECT * FROM room_members WHERE user_id = ? AND room_id = ?',
            [userId, roomId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Vous êtes déjà dans ce salon.' });
        }

        // Ajouter l'utilisateur au salon
        await db.query(
            'INSERT INTO room_members (user_id, room_id) VALUES (?, ?)',
            [userId, roomId]
        );

        res.status(200).json({ message: `Vous avez rejoint le salon avec succès.` });

    } catch (error) {
        console.error("Erreur pour rejoindre le salon :", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Récupérer les messages d'un salon spécifique
exports.getRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const [messages] = await db.query(
            `SELECT m.*, u.username 
             FROM messages m 
             JOIN users u ON m.user_id = u.id 
             WHERE m.room_id = ? 
             ORDER BY m.created_at ASC`, // On les veut dans l'ordre chronologique
            [roomId]
        );
        res.status(200).json(messages);
    } catch (error) {
        console.error("Erreur pour récupérer les messages du salon :", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};