const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: String,
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Reference to the manager
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]  // Array of team members
  });
  
module.exports = mongoose.model('Team', teamSchema);