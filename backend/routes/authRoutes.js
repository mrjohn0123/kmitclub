const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { auth } = require('../utils/middleware');
const clubController = require('../controllers/clubController');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);

module.exports = router; 