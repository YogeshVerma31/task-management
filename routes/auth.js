// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authenticateJWT = require('../middleware/auth');
const User = require('../models/User');

const rateLimit = require('express-rate-limit');


const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // Limit each IP to 5 login attempts per `windowMs`
    message: {
      status: 429,
      error: 'Too many login attempts, please try again after 10 minutes.'
    }
  });

// POST /auth/register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one digit')
    .matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character'),
    body('username').not().isEmpty().withMessage('username required'),

  ],
  authController.registerUser
);

// routes/auth.js
router.post(
    '/login',
    loginLimiter,
    [
      body('email').isEmail().withMessage('Please enter a valid email'),
      body('password').exists().withMessage('Password is required'),
    ],
    authController.loginUser
  );

  

router.get('/profile', authenticateJWT, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (err) {
      res.status(500).send('Server error');
    }
  });

  router.post('/logout', (req, res) => {
    // Invalidate token (e.g., add to a blacklist)
    res.json({ message: 'Logged out successfully' });
  });
  

module.exports = router;
