require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();

// ✅ MIDDLEWARES
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const registerRoutes = require('./routes/register');
const loginRoute = require('./routes/login');
const studentsRoute = require('./routes/students');
const uploadRoutes = require('./routes/upload');
const studentDashboardRoutes = require('./routes/studentDashboard');
const jobRoutes = require('./routes/job');
const applicationRoutes = require('./routes/application');
const resumeRoutes = require('./routes/resume');
const recruiterAuthRoutes = require('./routes/recruiterAuth');
const recruiterJobRoutes = require('./routes/recruiterJobs');
const verifierAuthRoutes = require('./routes/verifierAuth');
const verifierRoutes = require('./routes/verifier');
const adminAuthRoutes = require('./routes/adminAuth');
const recruiterDashboardRoutes = require('./routes/recruiterDashboard');
const adminDashboardRoutes = require('./routes/adminDashboard');
const authRoutes = require('./routes/auth');


app.use('/api/register', registerRoutes);
app.use('/api/login', loginRoute);
app.use('/api/students', studentsRoute);
app.use('/api/upload', uploadRoutes);
app.use('/api/students', studentDashboardRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/students/apply', applicationRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/recruiter/auth', recruiterAuthRoutes);
app.use('/api/recruiter/jobs', recruiterJobRoutes);
app.use('/api/verifier/auth', verifierAuthRoutes);
app.use('/api/verifier/actions', verifierRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/recruiter/dashboard', recruiterDashboardRoutes);
app.use('/api/admin', adminDashboardRoutes);
app.use('/api', authRoutes);


app.get('/', (req, res) => {
  res.send('👋 Backend is running smoothly, Akshu!');
});


app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is live at http://localhost:${PORT}`);
});
