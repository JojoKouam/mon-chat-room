const db = require('../config/db');

// Démarrer ou trouver une conversation privée
exports.startOrGetConversation = async (req, res) => {
    const currentUserId = req.user.id; // L'ID de l'utilisateur qui fait la demande
    const { targetUserId } = req.body; // L'ID de l'autre utilisateur

    // Sécurité de base
    if (!targetUserId || currentUserId == targetUserId) {
        return res.status(400).json({ message: 'ID utilisateur cible invalide.' });
    }

    try {
        // On cherche si un salon PRIVÉ existe déjà entre ces deux utilisateurs
        const [existingRooms] = await db.query(
            `SELECT r.id 
             FROM rooms r
             JOIN room_members rm1 ON r.id = rm1.room_id
             JOIN room_members rm2 ON r.id = rm2.room_id
             WHERE r.type = 'private'
               AND rm1.user_id = ?
               AND rm2.user_id = ?`,
            [currentUserId, targetUserId]
        );

        if (existingRooms.length > 0) {
            // Si on a trouvé une conversation, on renvoie simplement son ID
            console.log(`Conversation existante trouvée : ${existingRooms[0].id}`);
            return res.status(200).json({ roomId: existingRooms[0].id });
        }

        // --- Si aucune conversation n'existe, on en crée une nouvelle ---
        console.log('Aucune conversation, création en cours...');
        
        // 1. On crée un nouveau "salon" de type privé. Le nom est juste pour nous, pour le débogage.
        const [newRoom] = await db.query(
            "INSERT INTO rooms (nom, type) VALUES (?, 'private')",
            [`DM:${currentUserId}-${targetUserId}`]
        );
        const newRoomId = newRoom.insertId;

        // 2. On ajoute les deux utilisateurs comme membres de ce nouveau salon
        await db.query(
            'INSERT INTO room_members (user_id, room_id) VALUES (?, ?), (?, ?)',
            [currentUserId, newRoomId, targetUserId, newRoomId]
        );

        // 3. On renvoie l'ID du salon qui vient d'être créé
        console.log(`Nouvelle conversation créée avec l'ID : ${newRoomId}`);
        res.status(201).json({ roomId: newRoomId });

    } catch (error) {
        console.error("Erreur lors de la création/recherche de conversation :", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};