// backend/controllers/conversationController.js
const db = require('../config/db');

// Démarrer ou trouver une conversation privée
exports.startOrGetConversation = async (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = parseInt(req.body.id, 10);

  if (isNaN(targetUserId) || currentUserId === targetUserId) {
    return res.status(400).json({ message: 'ID utilisateur invalide.' });
  }

  try {
    const findRoomQuery = `
      SELECT r.id
      FROM rooms r
      JOIN room_members rm1 ON r.id = rm1.room_id AND rm1.user_id = ?
      JOIN room_members rm2 ON r.id = rm2.room_id AND rm2.user_id = ?
      WHERE r.type = 'private'
    `;
    const [existingRooms] = await db.query(findRoomQuery, [currentUserId, targetUserId]);

    if (existingRooms.length > 0) {
      return res.status(200).json({ roomId: existingRooms[0].id });
    }

    const [newRoom] = await db.query('INSERT INTO rooms (type, nom) VALUES (?, ?)', ['private', `DM entre ${currentUserId} et ${targetUserId}`]);
    const newRoomId = newRoom.insertId;

    await db.query('INSERT INTO room_members (user_id, room_id) VALUES (?, ?), (?, ?)', [currentUserId, newRoomId, targetUserId, newRoomId]);

    res.status(201).json({ roomId: newRoomId });
  } catch (error) {
    console.error("Erreur dans startOrGetConversation:", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Lister toutes les conversations existantes
// Dans backend/controllers/conversationController.js

exports.getAllConversations = async (req, res) => {
    const currentUserId = req.user.id;
    try {
        const query = `
            SELECT
                r.id,
                other_user.id AS other_user_id, /* <--- C'EST LA SEULE LIGNE À AJOUTER */
                other_user.username AS other_user_username,
                other_user.avatar_url AS other_user_avatar_url,
                
                (SELECT COUNT(*) 
                 FROM messages m 
                 WHERE m.room_id = r.id AND m.created_at > IFNULL(rs.last_read_at, '1970-01-01') AND m.user_id != ?) 
                AS unread_count,

                lm.content AS last_message_content,
                lm.created_at AS last_message_created_at,
                lm.type AS last_message_type

            FROM room_members AS current_user_membership
            JOIN rooms AS r ON current_user_membership.room_id = r.id AND r.type = 'private'
            JOIN room_members AS other_user_membership ON r.id = other_user_membership.room_id AND other_user_membership.user_id != ?
            JOIN users AS other_user ON other_user.id = other_user_membership.user_id
            LEFT JOIN read_status rs ON r.id = rs.room_id AND rs.user_id = ?
            LEFT JOIN (
                SELECT room_id, content, created_at, type, ROW_NUMBER() OVER(PARTITION BY room_id ORDER BY created_at DESC) as rn
                FROM messages
            ) AS lm ON r.id = lm.room_id AND lm.rn = 1
            WHERE current_user_membership.user_id = ?
            ORDER BY lm.created_at DESC;
        `;
        const [conversations] = await db.query(query, [currentUserId, currentUserId, currentUserId, currentUserId]);
        res.status(200).json(conversations);
    } catch (error) {
        console.error("Erreur lors de la récupération des conversations :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};