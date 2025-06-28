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

// Fonction pour créer une salle
exports.createRoom = async (req, res) => {
    const { name, description } = req.body;
    const ownerId = req.user.id; // On récupère l'ID du créateur via le token

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Le nom de la salle est obligatoire.' });
    }

    try {
        // 1. Insérer la nouvelle salle
        const [result] = await db.query(
            "INSERT INTO rooms (nom, description, owner_id, type) VALUES (?, ?, ?, 'public')",
            [name, description || null, ownerId]
        );
        const newRoomId = result.insertId;

        // 2. Ajouter automatiquement le créateur comme membre
        await db.query('INSERT INTO room_members (user_id, room_id) VALUES (?, ?)', [ownerId, newRoomId]);

        // 3. Renvoyer la nouvelle salle
        const [newRoom] = await db.query('SELECT id, nom AS name, description, type, owner_id FROM rooms WHERE id = ?', [newRoomId]);
        res.status(201).json(newRoom[0]);

    } catch (error) {
        console.error("Erreur lors de la création de la salle :", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Fonction pour modifier une salle
exports.updateRoom = async (req, res) => {
    const { name, description } = req.body;
    const roomId = req.params.id;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Le nom de la salle est obligatoire.' });
    }

    try {
        // Vérification : l'utilisateur est-il le propriétaire ?
        const [rows] = await db.query('SELECT owner_id FROM rooms WHERE id = ?', [roomId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Salle non trouvée.' });
        }
        if (rows[0].owner_id !== userId) {
            return res.status(403).json({ message: "Action non autorisée. Vous n'êtes pas le propriétaire." });
        }

        // Si c'est bon, on met à jour
        await db.query('UPDATE rooms SET nom = ?, description = ? WHERE id = ?', [name, description || null, roomId]);
        res.status(200).json({ message: 'Salle mise à jour avec succès.' });

    } catch (error) {
        console.error("Erreur lors de la mise à jour de la salle :", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Fonction pour supprimer une salle
exports.deleteRoom = async (req, res) => {
    const roomId = req.params.id;
    const userId = req.user.id;

    try {
        // MÊME VÉRIFICATION D'AUTORISATION
        const [rows] = await db.query('SELECT owner_id FROM rooms WHERE id = ?', [roomId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Salle non trouvée.' });
        }
        if (rows[0].owner_id !== userId) {
            return res.status(403).json({ message: 'Action non autorisée.' });
        }

        // On supprime la salle. Note : Il faudrait idéalement aussi supprimer les membres et les messages (ou les archiver).
        // Pour l'instant, on se contente de supprimer la salle.
        await db.query('DELETE FROM rooms WHERE id = ?', [roomId]);
res.sendStatus(204);
    } catch (error) {
        console.error("Erreur lors de la suppression de la salle :", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};