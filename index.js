const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const createAdmin = require('./controllers/adminController');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const adminRoutes = require('./routes/admin');
const managerRoutes = require('./routes/manager');

const app = express();

// Middleware
app.use(express.json());

createAdmin.createAdmin();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=>console.log("DB Connection Successfull!")).catch(err=>console.log(err.toString()));;

// Routes
app.use('/auth', authRoutes);
app.use('/task', taskRoutes);
app.use('/admin', adminRoutes);
app.use('/manager', managerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
