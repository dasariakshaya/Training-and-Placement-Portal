// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

const uploadsDir = path.join(__dirname, 'uploads');
const jobPdfsDir = path.join(uploadsDir, 'job_pdfs');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(jobPdfsDir)) fs.mkdirSync(jobPdfsDir);


// --- ✅ CORE MIDDLEWARE ---
const corsOptions = {
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: 'GET,POST,PATCH,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ✅ STATIC FILE SERVING ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/job_pdfs', express.static(path.join(__dirname, 'uploads/job_pdfs')));


// --- ✅ API ROUTES ---
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/studentRoutes');
const recruiterJobsRoutes = require('./routes/recruiterJobs');
const adminDashboardRoutes = require('./routes/adminDashboard');
const verifierRoutes = require('./routes/verifier');
const jobRoutes = require('./routes/job');
const applicationRoutes = require('./routes/application');
const uploadRoutes = require('./routes/upload');
const recruiterAuthRoutes = require('./routes/recruiterAuth');
const recruiterDashboardRoutes = require('./routes/recruiterDashboard');
const adminAuthRoutes = require('./routes/adminAuth'); // ✅ 1. IMPORT the admin auth routes

app.use('/api/auth', authRoutes);
app.use('/api/auth/recruiter', recruiterAuthRoutes);
app.use('/api/auth/admin', adminAuthRoutes); // ✅ 2. MOUNT the admin auth routes
app.use('/api/students', studentRoutes);
app.use('/api/recruiter', recruiterJobsRoutes);
app.use('/api/recruiter/dashboard', recruiterDashboardRoutes);
app.use('/api/admin', adminDashboardRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/upload', uploadRoutes);


// --- ✅ TEST & FALLBACK ROUTES ---
app.get('/', (req, res) => {
  res.send('👋 Backend is running smoothly!');
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});


// --- ✅ DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://TNP_Member:nZaxjCSwn5PTVmdk@cluster0.vaze4je.mongodb.net/tnpPortalDB?retryWrites=true&w=majority&appName=Cluster0';

const connectionSource = MONGO_URI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB';

mongoose.connect(MONGO_URI)
  .then(() => console.log(`✅ Connected to ${connectionSource} successfully.`))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });


// --- ✅ START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is live and listening at http://localhost:${PORT}`);
});