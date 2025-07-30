const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { auth } = require('../utils/middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);

module.exports = router; 