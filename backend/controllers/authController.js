const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// La logique pour l'inscription
exports.register = async (req, res) => {
    try {
        // 1. Récupérer les données envoyées par le client (React)
        const { username, email, password, age, gender, intention } = req.body;

        // 2. Vérifier si l'utilisateur ou l'email existe déjà
        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            // Si on trouve un utilisateur, on renvoie une erreur
            return res.status(409).json({ message: 'Le nom d\'utilisateur ou l\'email est déjà utilisé.' });
        }

        // 3. Hacher le mot de passe (le sécuriser)
        const salt = await bcrypt.genSalt(10); // Génère une "clé" de salage
        const hashedPassword = await bcrypt.hash(password, salt); // Hache le mot de passe



        // 4. Créer l'URL de l'avatar par défaut en utilisant le service DiceBear
        const defaultAvatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(username)}`;

        // 5. Insérer le nouvel utilisateur dans la base de données (AVEC L'AVATAR)
        const query = `
            INSERT INTO users (username, email, password, age, gender, intention, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(query, [username, email, hashedPassword, age, gender, intention, defaultAvatarUrl]);
        
        // --- FIN DE LA PARTIE À AJOUTER/MODIFIER ---


        // 6. Envoyer une réponse de succès
        res.status(201).json({ message: 'Utilisateur créé avec succès !' });


    } catch (error) {
        // En cas d'erreur serveur, on envoie une réponse d'erreur générique
        console.error("Erreur lors de l'inscription :", error);
        res.status(500).json({ message: 'Erreur serveur lors de la création du compte.' });
    }
};

// La logique pour la connexion
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const payload = { 
            user: { id: user.id },
            username: user.username 
         };

        // On signe le token...
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // ... PUIS on envoie la réponse UNE SEULE FOIS avec toutes les infos.
        res.status(200).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
    }
};
// Logique pour récupérer les données de l'utilisateur actuellement connecté
exports.getMe = async (req, res) => {
    console.log('--- Contrôleur getMe atteint ! ---');
    console.log('Utilisateur dans la requête:', req.user); // On vérifie si req.user est bien là
    try {
        // Grâce à notre middleware, req.user.id est disponible !
        const [users] = await db.query('SELECT id, username, email, age, gender, intention, avatar_url, created_at FROM users WHERE id = ?', [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur serveur');
    }
};
