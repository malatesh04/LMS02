const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const generateTokens = async (userId, email, role) => {
    try {
        // Debug: ensure JWT_SECRET3 is available
        console.log('generateTokens called with userId:', userId, 'JWT_SECRET3 exists:', !!process.env.JWT_SECRET3);

        const accessToken = jwt.sign(
            { user_id: userId, email, role },
            process.env.JWT_SECRET3 || 'fallback_secret',
            { expiresIn: '15m' }
        );

        const refreshTokenString = crypto.randomBytes(40).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(refreshTokenString).digest('hex');

        // 30 days
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Try to create refresh_tokens table if it doesn't exist (for existing databases)
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS refresh_tokens (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
                    token_hash TEXT NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    revoked_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        } catch (e) {
            console.log('Table creation skipped or failed:', e.message);
        }

        // Try to insert refresh token, but continue if it fails (for existing DBs without the table)
        try {
            await db.query(
                'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
                [userId, tokenHash, expiresAt]
            );
        } catch (e) {
            console.log('Refresh token insert failed (table may not exist):', e.message);
        }

        return { accessToken, refreshTokenString };
    } catch (err) {
        console.error('Error in generateTokens:', err);
        throw err;
    }
};

const setRefreshCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // or 'none' if cross origin
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
};

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email, role, status',
            [name, email, password_hash, role || 'student', 'approved']
        );

        const user = newUser.rows[0];
        const { accessToken, refreshTokenString } = await generateTokens(user.user_id, user.email, user.role);

        setRefreshCookie(res, refreshTokenString);
        res.json({ token: accessToken, user });
    } catch (err) {
        console.error('VERCEL SIGNUP ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message, stack: err.stack });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) return res.status(400).json({ error: 'Invalid Credentials' });

        const user = userResult.rows[0];

        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Account pending admin approval' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid Credentials' });

        // Debug: check if JWT_SECRET3 is available
        if (!process.env.JWT_SECRET3) {
            console.error('JWT_SECRET3 is undefined!');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const { accessToken, refreshTokenString } = await generateTokens(user.user_id, user.email, user.role);

        setRefreshCookie(res, refreshTokenString);
        res.json({ token: accessToken, user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role, status: user.status } });
    } catch (err) {
        console.error('VERCEL LOGIN ERROR:', err);
        // Provide more detailed error for debugging
        const errorMessage = err.message || 'Unknown error';
        const isBcryptError = errorMessage.includes('bcrypt') || errorMessage.includes('hash');
        const isJwtError = errorMessage.includes('JWT') || errorMessage.includes('jwt');
        const isDbError = errorMessage.includes('database') || errorMessage.includes('DB') || errorMessage.includes('relation');

        let userMessage = 'Server error';
        if (isBcryptError) userMessage = 'Password verification failed';
        else if (isJwtError) userMessage = 'Authentication token generation failed';
        else if (isDbError) userMessage = 'Database operation failed';

        res.status(500).json({ error: userMessage, details: errorMessage });
    }
});

router.post('/refresh', async (req, res) => {
    try {
        const tokenString = req.cookies.refreshToken;
        if (!tokenString) return res.status(401).json({ error: 'No refresh token' });

        const tokenHash = crypto.createHash('sha256').update(tokenString).digest('hex');

        const tokenRes = await db.query(
            'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()',
            [tokenHash]
        );

        if (tokenRes.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        const userId = tokenRes.rows[0].user_id;
        const userRes = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);

        if (userRes.rows.length === 0) return res.status(401).json({ error: 'User not found' });

        const user = userRes.rows[0];

        // Revoke old token
        await db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [tokenRes.rows[0].id]);

        // Issue new tokens (rotation)
        const { accessToken, refreshTokenString } = await generateTokens(user.user_id, user.email, user.role);
        setRefreshCookie(res, refreshTokenString);

        res.json({ token: accessToken });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/logout', async (req, res) => {
    try {
        const tokenString = req.cookies.refreshToken;
        if (tokenString) {
            const tokenHash = crypto.createHash('sha256').update(tokenString).digest('hex');
            await db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
        }
        res.clearCookie('refreshToken');
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const userCheck = await db.query('SELECT user_id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length === 0) {
            return res.json({ message: 'If that email is in our system, we have sent a reset link to it.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await db.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
            [tokenHash, expiresAt, email]
        );

        res.json({
            message: 'If that email is in our system, we have sent a reset link to it.',
            devResetToken: resetToken
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const userRes = await db.query(
            'SELECT user_id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [tokenHash]
        );

        if (userRes.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE user_id = $2',
            [password_hash, userRes.rows[0].user_id]
        );

        res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userResult = await db.query('SELECT user_id, name, email, role, profile_image_url FROM users WHERE user_id = $1', [req.user.user_id]);
        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
