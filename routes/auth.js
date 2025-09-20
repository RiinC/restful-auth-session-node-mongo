// routes/auth.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: User registration failed
 */
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


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid username or password
 */
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

        res.json({
            message: 'Login successful!',
            userId: user._id,
            username: user.username
        });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Logout failed
 */
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


/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get the profile of the logged-in user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
// Protected route
router.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

module.exports = router;

