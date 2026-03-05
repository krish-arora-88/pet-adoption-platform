const express = require('express');
const jwt = require('jsonwebtoken');
const { passport, requireAuth } = require('./middleware/auth');
const { validate } = require('./middleware/validate');
const { registerSchema, loginSchema } = require('./validation/schemas');
const { User } = require('./models');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

function generateToken(user) {
    return jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ success: false, error: 'Email already registered' });
        }
        const user = await User.create({
            email,
            passwordHash: password,
            role: role === 'admin' ? 'admin' : 'user'
        });
        const token = generateToken(user);
        res.status(201).json({ success: true, token, user: { email: user.email, role: user.role } });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

router.post('/login', validate(loginSchema), (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return res.status(500).json({ success: false, error: 'Login failed' });
        if (!user) return res.status(401).json({ success: false, error: info?.message || 'Invalid credentials' });
        const token = generateToken(user);
        res.json({ success: true, token, user: { email: user.email, role: user.role } });
    })(req, res, next);
});

router.get('/me', requireAuth, (req, res) => {
    res.json({ success: true, user: { email: req.user.email, role: req.user.role } });
});

module.exports = router;
