// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/sessionAuth', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Session setup (with cookies)
app.use(
    session({
        secret: 'mysecretkey',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/sessionAuth' }),
        cookie: {
            httpOnly: true,       // prevents client-side JS from reading cookie
            secure: false,        // set true if using HTTPS
            maxAge: 1000 * 60 * 60, // 1 hour
        },
    })
);


// Routes
app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
