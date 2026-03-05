require('dotenv').config();
const express = require('express');
const { passport } = require('./middleware/auth');
const appController = require('./appController');
const authController = require('./authController');

const app = express();
const PORT = process.env.PORT || 50003;

app.use(express.static('public'));
app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authController);
app.use('/', appController);

app.get('/pages', (req, res) => {
    res.redirect('/');
});

module.exports = app;

if (require.main === module) {
    const { connectDB } = require('./db');
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}/`);
        });
    });
}
