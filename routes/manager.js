const express = require('express');
const authenticateJWT = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const { body } = require('express-validator');
const managerController = require('../controllers/managerController');

const router = express.Router();

router.post('/teams/:teamId/addMember',
     authenticateJWT, 
     authorizeRoles('Manager'),
     [
        body('teamId').not().isEmpty().withMessage('Team Id required'),
        body('userId').not().isEmpty().withMessage('User Id is required'),
      ],
     
     managerController.assignTask);

module.exports = router;