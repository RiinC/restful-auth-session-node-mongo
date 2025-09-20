// routes/auth.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(400).json({ error: 'User registration failed', details: err.message });
    }
});


// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        req.session.userId = user._id;

        // Express-session will auto set cookie, but let's send confirmation
        res.cookie('sid', req.sessionID, {
            httpOnly: true,
            secure: false, // change to true if using HTTPS
            maxAge: 1000 * 60 * 60,
        });

        res.json({ message: 'Login successful!' });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});


// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Logout failed' });

        // Clear cookies
        res.clearCookie('sid');
        res.clearCookie('connect.sid'); // remove session cookie
        res.json({ message: 'Logout successful!' });
    });
});


// Protected route
router.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await User.findById(req.session.userId).select('-password');
    res.json(user);
});

module.exports = router;

