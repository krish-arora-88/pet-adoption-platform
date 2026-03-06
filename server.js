require('dotenv').config();
const path = require('path');
const express = require('express');
const { passport } = require('./middleware/auth');
const { connectDB } = require('./db');
const appController = require('./appController');
const authController = require('./authController');

const app = express();
const PORT = process.env.PORT || 50003;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(passport.initialize());

// Ensure DB is connected before handling API requests
let dbReady = null;
app.use((req, res, next) => {
    if (!dbReady) {
        dbReady = connectDB();
    }
    dbReady.then(() => next()).catch(next);
});

app.use('/auth', authController);
app.use('/', appController);

app.get('/pages', (req, res) => {
    res.redirect('/');
});

module.exports = app;

if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}/`);
        });
    });
}
