const jwt = require('jsonwebtoken');

// Use JWT_SECRET3 to match the token generation in auth routes
const JWT_SECRET = process.env.JWT_SECRET3 || process.env.JWT_SECRET || 'default_secret';

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { user_id, email, role }
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};

module.exports = { authMiddleware, roleMiddleware };
