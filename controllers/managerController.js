
const { responseMessage } = require('../utils/response');
const { validationResult } = require('express-validator');
 
const Team = require('../models/Team');
const User = require('../models/User');


exports.assignTask = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { userId } = req.body;
      const { teamId } = req.params;
  
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
  
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the user is already a member of the team
      if (team.members.includes(userId)) {
        return res.status(400).json({ message: 'User is already a member of the team' });
      }
  
      // Add the user to the team's members
      team.members.push(userId);
      await team.save();
  
      res.status(200).json({ message: 'User added to the team successfully', team });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  };