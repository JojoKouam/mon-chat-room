const cloudinary = require('../config/cloudinaryConfig');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier sélectionné.' });
        }
        // req.file.path vient de multer
        const result = await cloudinary.uploader.upload(req.file.path);
        // On renvoie l'URL sécurisée de l'image uploadée
        res.status(200).json({ url: result.secure_url });
    } catch (error) {
        console.error("Erreur d'upload :", error);
        res.status(500).json({ message: 'Erreur lors de l\'upload du fichier.' });
    }
};