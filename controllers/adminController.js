//createAdmin.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Team = require('../models/Team');
const { validationResult } = require('express-validator');
const EmailService = require('../service/emailService');



const createAdmin = async () => {
    try {
        // Check if an admin already exists
        const adminExists = await User.findOne({ role: 'Admin' });

        if (adminExists) {
            console.log('Admin user already exists.');
            return;
        }

        // Create an admin user if none exists
        const adminData = {
            username: 'admin', // Static username
            email: 'admin@gmail.com', // Static email
            password: 'admin123', // Static password (you can hash it before saving)
            roles: 'Admin',
        };

        // Hash the password
        var user = new User(adminData);
        await user.save();
        console.log('Admin user created:', adminData.email);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
    }
};

const createTeam = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const { name, managerId } = req.body;

        // Check if the manager exists
        const manager = await User.findById(managerId);
        if (!manager || manager.roles[0] !== 'Manager') {
            return res.status(400).json({ message: 'Invalid manager ID or user is not a manager.' });
        }

        // Create a new team
        const team = new Team({
            name,
            manager: managerId,
            members: [managerId]
        });

        await team.save();
        res.status(200).json({ message: 'Team created successfully', team });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};


const createManager = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ username, email, password, roles: "Manager" });
        await user.save();

        EmailService.sendEmail(email);

        res.status(201).json({ msg: 'Manager registered successfully' });
    } catch (err) {
        res.status(500).send({ msg: "Server Error ",err:err.message });
    }
}

module.exports = {
    createAdmin,
    createTeam,
    createManager
}
