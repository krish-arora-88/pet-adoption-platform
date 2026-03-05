const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

passport.use(new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) return done(null, false, { message: 'Invalid email or password' });
            const isMatch = await user.comparePassword(password);
            if (!isMatch) return done(null, false, { message: 'Invalid email or password' });
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.use(new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET
    },
    async (payload, done) => {
        try {
            const user = await User.findById(payload.sub);
            if (!user) return done(null, false);
            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
    }
));

function requireAuth(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ success: false, error: 'Authentication required' });
        req.user = user;
        next();
    })(req, res, next);
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
}

module.exports = { passport, requireAuth, requireAdmin };
