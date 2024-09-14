// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const authenticateJWT = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');




const router = express.Router();

// routes/admin.js
router.post(
    '/createTeam',
    authenticateJWT,
    [
      body('name').not().isEmpty().withMessage('name required'),
      body('managerId').not().isEmpty().withMessage('Manager id is required'),
    ],
    adminController.createTeam
  );


  // POST /auth/register
router.post(
    '/createManager',
    authenticateJWT,
    authorizeRoles('Admin'),
    [
      body('email').isEmail().withMessage('Please enter a valid email'),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/\d/).withMessage('Password must contain at least one digit')
      .matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character'),
      body('username').not().isEmpty().withMessage('username required'),
    ],
    adminController.createManager
  );
  

module.exports = router;
