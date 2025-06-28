// backend/controllers/readStatusController.js
const db = require('../config/db');

exports.markAsRead = async (req, res) => {
  const userId = req.user.id;
  const roomId = req.params.roomId;

  try {
    // ON DUPLICATE KEY UPDATE est une astuce MySQL : si la paire (user_id, room_id) existe, il la met à jour.
    // Sinon, il l'insère. C'est parfait pour notre cas.
    const query = `
      INSERT INTO read_status (user_id, room_id, last_read_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE last_read_at = NOW();
    `;
    await db.query(query, [userId, roomId]);
    res.status(200).json({ message: 'Marqué comme lu.' });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de lecture :", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};