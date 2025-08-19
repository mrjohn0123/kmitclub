const express = require('express');
const { register, login, getProfile, createCoordinator, changePassword, updateProfile } = require('../controllers/authController');
const { auth, requireRole } = require('../utils/middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.post('/change-password', auth, changePassword);
router.put('/update-profile', auth, updateProfile);
router.post('/create-coordinator', auth, requireRole('admin'), createCoordinator);

module.exports = router; 