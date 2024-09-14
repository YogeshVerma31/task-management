const express = require('express');
const authenticateJWT = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

const taskController = require('../controllers/taskController');

const router = express.Router();

// router.get('/analytics/user/:userId', 


// Only admins and managers can create tasks
router.get('/assign', authenticateJWT, taskController.viewAssignedTask);
router.get('/analytics/user/:userId', authenticateJWT, taskController.analyticsByUserId);
router.get('/analytics/team/:teamId',authenticateJWT, authorizeRoles('Admin', 'Manager'), taskController.analyticsByTeamId);

router.post('/create', authenticateJWT, authorizeRoles('Admin', 'Manager'), taskController.createTask);
router.get('/:id', authenticateJWT, authorizeRoles('Admin', 'Manager','User'), taskController.readTask);
router.delete('/:id', authenticateJWT, authorizeRoles('Admin', 'Manager'), taskController.deleteTask);
router.patch('/:id', authenticateJWT, authorizeRoles('Admin', 'Manager'), taskController.updateTask);

router.post('/assign', authenticateJWT, authorizeRoles('Manager'), taskController.assignTask);


module.exports = router;    