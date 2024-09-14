// controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User');
const { responseMessage } = require('../utils/response');
const Team = require('../models/Team');
const mongoose = require('mongoose');




exports.createTask = async (req, res) => {
    const { title, description, dueDate, priority, userId } = req.body;
    try {
        if (!userId) {
            return res.status(401).send(responseMessage(401, "User id required"))
        }

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(401).send(responseMessage(401, "User not found!"))
        }

        const task = await Task.create({
            title,
            description,
            dueDate,
            priority,
            assignedTo: userId,
            createdBy: req.user.id
        });
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.readTask = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(401).send(responseMessage(401, "Task id required"))
        }
        const task = await Task.findOne({ _id: id });
        if (!task) {
            return res.status(401).send(responseMessage(401, "Task not found!"))
        }
        const response = await Task.findOne({ _id: id }).populate({
            path: 'assignedTo',
            select: '-password'
        })
            .populate({
                path: 'createdBy',
                select: '-password'
            });
        res.status(201).json(responseMessage(200, "Success", response));
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


exports.updateTask = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(401).send(responseMessage(401, "Task id required"))
        }
        const task = await Task.findOne({ _id: id });
        if (!task) {
            return res.status(401).send(responseMessage(401, "Task not found!"))
        }
        const response = await Task.updateOne({ _id: id }, req.body)
        res.status(200).json({ success: true, message: "Task updated success" });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(401).send(responseMessage(401, "Task id required!"))
        }

        const findData = await Task.findOne({ _id: id });

        if (!findData) {
            return res.status(401).send(responseMessage(401, "Task not found!"))
        }

        const response = await Task.deleteOne({ _id: id })
        return res.status(200).send(responseMessage(200, "Task delete succesfully!"));
    } catch (e) {
        return res.status(500).send(responseMessage(500, e.toString()))
    }
}


exports.assignTask = async (req, res) => {
    try {
      const managerId = req.user.id; 
      const { taskId, userId } = req.body; 
  
      // Find the manager's team
      const team = await Team.findOne({ manager: managerId }).populate('members');
  
      if (!team) {
        return res.status(403).json({ message: 'You are not authorized to assign tasks.' });
      }
  
      // Check if the user belongs to the manager's team
      const isUserInTeam = team.members.some(member => member._id.toString() === userId);
  
      if (!isUserInTeam) {
        return res.status(403).json({ message: 'You can only assign tasks to users within your team.' });
      }
  
      // If the user is in the team, assign the task
      const task = await Task.findById(taskId);
      task.assignedTo = userId;
      await task.save();
  
      res.json({ message: 'Task assigned successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
};
  

exports.viewAssignedTask = async (req, res) =>  {
    try {
        const user = await User.findById(req.user.id); // Fetch the user making the request
        console.log(req.user.id);
        
        // Check if the user is an Admin or Manager
        if (user.roles.includes('Admin') || user.roles.includes('Manager')) {
          // Admins or Managers can view tasks assigned to their team or created by them
          const tasks = await Task.find({
            $or: [
              { assignedTo: user.id },      // Tasks assigned to the manager/admin
              { createdBy: user.id }        // Tasks created by the manager/admin
            ]
          }).populate('assignedTo', '-password'); // Populate assignedTo without password
          console.log("Task"+tasks);
        
          return res.status(200).json({ success: true, tasks });
        }
    
        // For regular users, only view their own tasks
        const tasks = await Task.find({ assignedTo: user.id }).populate('assignedTo', '-password');
        
        if (!tasks) {
          return res.status(404).json({ success: false, message: 'No tasks found' });
        }
    
        res.status(200).json({ success: true, tasks });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
      }
};


    
exports.analyticsByUserId = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Aggregate the count of tasks based on their status
      const taskStats = await Task.aggregate([
        { $match: { assignedTo: userId } },
        {
          $group: {
            _id: '$status', // Group by status (completed, pending, overdue)
            count: { $sum: 1 } // Count the number of tasks for each status
          }
        }
      ]);
  
      const stats = {
        completed: 0,
        pending: 0,
        overdue: 0
      };
  
      taskStats.forEach(stat => {
        stats[stat._id] = stat.count;
      });
  
      res.status(200).json({
        success: true,
        stats
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error'+err.toString() });
    }
  };
  
  // Analytics endpoint to get task statistics for a team (Admin or Manager only)
//   router.get('/analytics/team/:teamId', authorizeRoles('Admin', 'Manager'),
  
    
exports.analyticsByTeamId =  async (req, res) => {
    try {
      const teamId = req.params.teamId;
  
      // Assuming `teamMembers` are assigned to the tasks
      const taskStats = await Task.aggregate([
        { $match: { createdBy: teamId } },
        {
          $group: {
            _id: '$status', // Group by task status (completed, pending, overdue)
            count: { $sum: 1 } // Count the number of tasks per status
          }
        }
      ]);
  
      const stats = {
        completed: 0,
        pending: 0,
        overdue: 0
      };
  
      taskStats.forEach(stat => {
        stats[stat.id] = stat.count;
      });
  
      res.status(200).json({
        success: true,
        stats
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  
  