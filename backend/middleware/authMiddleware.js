const jwt = require('jsonwebtoken'); // <-- LA LIGNE MANQUANTE EST ICI !
require('dotenv').config();

module.exports = function(req, res, next) {
    // 1. Récupérer le token depuis l'en-tête (header) de la requête
    const token = req.header('x-auth-token');
    console.log('--- Auth Middleware ---');
    console.log('Token reçu:', token);

    // 2. Vérifier si le token n'existe pas
    if (!token) {
        console.log('Pas de token, accès refusé.');
        return res.status(401).json({ message: 'Aucun token, autorisation refusée.' });
    }

    // 3. Si un token existe, on le vérifie
    try {
        // On décode le token avec notre clé secrète
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token décodé avec succès:', decoded);

        // On attache les informations de l'utilisateur à la requête
        req.user = decoded.user;
        console.log('req.user attaché:', req.user);
        
        console.log('Appel de next() pour passer au contrôleur...');
        next();
    } catch (err) {
        console.log('Erreur de vérification du token:', err.message);
        res.status(401).json({ message: 'Le token n\'est pas valide.' });
    }
};